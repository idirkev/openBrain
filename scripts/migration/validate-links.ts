#!/usr/bin/env tsx
/**
 * Validate wikilinks in migrated documents
 * 
 * Usage:
 *   npx tsx validate-links.ts --docs-dir ../../documents
 */

import { readFile, readdir } from 'fs/promises'
import { join } from 'path'
import matter from 'gray-matter'

interface Link {
  source: string
  target: string
  context: string
}

interface ValidationResult {
  totalLinks: number
  brokenLinks: Link[]
  orphanedDocs: string[]
  summary: Record<string, number>
}

async function* walkDir(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    
    if (entry.isDirectory()) {
      yield* walkDir(fullPath)
    } else if (entry.name.endsWith('.md')) {
      yield fullPath
    }
  }
}

function extractWikilinks(content: string): string[] {
  const links: string[] = []
  const regex = /\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g
  
  let match
  while ((match = regex.exec(content)) !== null) {
    links.push(match[1].trim())
  }
  
  return links
}

async function loadDocumentIndex(docsDir: string): Promise<Map<string, string>> {
  const index = new Map<string, string>()
  
  for await (const filePath of walkDir(docsDir)) {
    const content = await readFile(filePath, 'utf-8')
    const parsed = matter(content)
    
    // Index by filename (without extension)
    const filename = filePath.split('/').pop()?.replace('.md', '')
    if (filename) {
      index.set(filename, filePath)
    }
    
    // Index by title
    if (parsed.data.title) {
      const titleSlug = parsed.data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
      index.set(titleSlug, filePath)
    }
    
    // Index by type:slug pattern
    if (parsed.data.type && filename) {
      index.set(`${parsed.data.type}:${filename}`, filePath)
    }
  }
  
  return index
}

async function validateLinks(docsDir: string): Promise<ValidationResult> {
  console.log('🔍 Loading document index...')
  const index = await loadDocumentIndex(docsDir)
  console.log(`  Indexed ${index.size} documents`)
  
  const allLinks: Link[] = []
  const documentsWithLinks = new Set<string>()
  const documentsWithBacklinks = new Set<string>()
  
  console.log('🔗 Extracting wikilinks...')
  
  for await (const filePath of walkDir(docsDir)) {
    const content = await readFile(filePath, 'utf-8')
    const relativePath = filePath.replace(docsDir, '').replace(/^\//, '')
    
    const links = extractWikilinks(content)
    
    if (links.length > 0) {
      documentsWithLinks.add(relativePath)
    }
    
    for (const target of links) {
      allLinks.push({
        source: relativePath,
        target,
        context: '' // Could extract surrounding text
      })
      documentsWithBacklinks.add(target)
    }
  }
  
  console.log(`  Found ${allLinks.length} links in ${documentsWithLinks.size} documents`)
  
  // Check for broken links
  const brokenLinks: Link[] = []
  
  for (const link of allLinks) {
    // Try to resolve target
    const target = link.target
    const resolved = 
      index.has(target) ||
      index.has(target.toLowerCase()) ||
      index.has(target.replace(/-/g, ' '))
    
    if (!resolved) {
      brokenLinks.push(link)
    }
  }
  
  // Find orphaned documents (no links in or out)
  const orphanedDocs: string[] = []
  
  for await (const filePath of walkDir(docsDir)) {
    const relativePath = filePath.replace(docsDir, '').replace(/^\//, '')
    const filename = relativePath.replace('.md', '')
    
    const hasOutgoingLinks = documentsWithLinks.has(relativePath)
    const hasIncomingLinks = documentsWithBacklinks.has(filename) || 
                             documentsWithBacklinks.has(filename.replace(/-/g, ' '))
    
    if (!hasOutgoingLinks && !hasIncomingLinks) {
      orphanedDocs.push(relativePath)
    }
  }
  
  // Summary by link type
  const summary: Record<string, number> = {}
  
  for (const link of allLinks) {
    const type = link.target.split(':')[0] || 'unknown'
    summary[type] = (summary[type] || 0) + 1
  }
  
  return {
    totalLinks: allLinks.length,
    brokenLinks,
    orphanedDocs,
    summary
  }
}

async function main() {
  const args = process.argv.slice(2)
  const docsDir = args.find((_, i) => args[i - 1] === '--docs-dir') || './documents'
  
  console.log(`📁 Validating links in ${docsDir}\n`)
  
  const result = await validateLinks(docsDir)
  
  console.log('\n📊 Validation Results:')
  console.log(`  Total links: ${result.totalLinks}`)
  console.log(`  Broken links: ${result.brokenLinks.length}`)
  console.log(`  Orphaned docs: ${result.orphanedDocs.length}`)
  
  if (result.brokenLinks.length > 0) {
    console.log('\n❌ Broken Links:')
    result.brokenLinks.slice(0, 20).forEach(link => {
      console.log(`  ${link.source} → [[${link.target}]]`)
    })
    
    if (result.brokenLinks.length > 20) {
      console.log(`  ... and ${result.brokenLinks.length - 20} more`)
    }
  }
  
  if (result.orphanedDocs.length > 0) {
    console.log('\n⚠️  Orphaned Documents (no links in or out):')
    result.orphanedDocs.slice(0, 10).forEach(doc => {
      console.log(`  ${doc}`)
    })
    
    if (result.orphanedDocs.length > 10) {
      console.log(`  ... and ${result.orphanedDocs.length - 10} more`)
    }
  }
  
  console.log('\n📈 Link Types:')
  Object.entries(result.summary)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`)
    })
  
  // Exit with error code if broken links found
  if (result.brokenLinks.length > 0) {
    console.log('\n❌ Validation failed: Broken links found')
    process.exit(1)
  }
  
  console.log('\n✅ All links valid!')
}

main().catch(console.error)
