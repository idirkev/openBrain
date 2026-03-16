#!/usr/bin/env tsx
/**
 * Transform exported JSON to Markdown documents
 * 
 * Usage:
 *   npx tsx transform-to-markdown.ts --input decisions.json --output-dir ../../documents/20-permanent/
 */

import { readFile, writeFile, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import matter from 'gray-matter'

interface Thought {
  id: string
  content: string
  metadata: {
    template?: string
    type?: string
    people?: string[]
    action_items?: string[]
    topics?: string[]
    source?: string
    emoji?: string
  }
  created_at: string
}

interface ExportData {
  exported_at: string
  filters: Record<string, string>
  count: number
  records: Thought[]
}

// Template → Document type mapping
const TEMPLATE_MAP: Record<string, { type: string; folder: string }> = {
  'Decision': { type: 'decision', folder: '20-permanent' },
  'Risk': { type: 'risk', folder: '20-permanent' },
  'Milestone': { type: 'milestone', folder: '20-permanent' },
  'Spec': { type: 'spec', folder: '20-permanent' },
  'Meeting Debrief': { type: 'meeting', folder: '00-fleeting/02-meetings' },
  'Person Note': { type: 'person', folder: '20-permanent' },
  'Stakeholder': { type: 'stakeholder', folder: '20-permanent' },
  'Sent': { type: 'sent', folder: '00-fleeting' },
  'Budget': { type: 'budget', folder: '30-projects' },
  'Invoice': { type: 'invoice', folder: '30-projects' },
  'Funding': { type: 'funding', folder: '30-projects' },
  'Legal': { type: 'legal', folder: '30-projects' },
  'Compliance': { type: 'compliance', folder: '30-projects' },
  'Contract': { type: 'contract', folder: '30-projects' },
  'Insight': { type: 'insight', folder: '20-permanent' },
  'AI Save': { type: 'ai_save', folder: '10-literature' },
  'Nutrition': { type: 'nutrition', folder: '20-permanent' },
  'Health': { type: 'health', folder: '20-permanent' },
  'Home': { type: 'home', folder: '20-permanent' }
}

// TSM Framework mapping
const TSM_MAP: Record<string, { stack: string; node: string }> = {
  'Decision': { stack: 'global', node: 'horizon-2' },
  'Risk': { stack: 'global', node: 'horizon-1' },
  'Milestone': { stack: 'global', node: 'bridge' },
  'Spec': { stack: 'external', node: 'platform' },
  'Meeting Debrief': { stack: 'internal', node: 'discourse' },
  'Person Note': { stack: 'internal', node: 'emotion' },
  'Stakeholder': { stack: 'external', node: 'engagement' },
  'Budget': { stack: 'global', node: 'economy' },
  'Funding': { stack: 'global', node: 'economy' },
  'Contract': { stack: 'external', node: 'governance' },
  'Insight': { stack: 'internal', node: 'intuition' },
  'AI Save': { stack: 'external', node: 'platform' }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50)
}

function extractTitle(content: string): string {
  // First sentence or first 50 chars
  const firstSentence = content.split(/[.!?]/)[0]
  return firstSentence.length > 50 
    ? firstSentence.substring(0, 50) + '...'
    : firstSentence
}

function generateFilename(thought: Thought): string {
  const date = thought.created_at.split('T')[0]
  const template = thought.metadata?.template || 'note'
  const title = slugify(extractTitle(thought.content))
  
  // Special handling for meetings - use date prefix
  if (template === 'Meeting Debrief') {
    return `${date}-${title}.md`
  }
  
  // Person notes - use person prefix
  if (template === 'Person Note') {
    const person = thought.metadata?.people?.[0] || 'unknown'
    return `person-${slugify(person)}.md`
  }
  
  // Default: type-date-title
  return `${TEMPLATE_MAP[template]?.type || 'note'}-${date}-${title}.md`
}

function transformToMarkdown(thought: Thought): { path: string; content: string } {
  const template = thought.metadata?.template
  const mapping = TEMPLATE_MAP[template] || { type: 'fleeting', folder: '00-fleeting' }
  const tsm = TSM_MAP[template]
  
  // Build frontmatter
  const frontmatter: Record<string, any> = {
    type: mapping.type,
    title: extractTitle(thought.content),
    captured_date: thought.created_at,
    source: thought.metadata?.source || 'unknown',
    access_level: 'team',
    legacy_id: thought.id
  }
  
  // Add optional fields
  if (thought.metadata?.template) {
    frontmatter.template = thought.metadata.template
  }
  
  if (thought.metadata?.people?.length) {
    frontmatter.people = thought.metadata.people.map(p => `[[person:${p}]]`)
  }
  
  if (thought.metadata?.topics?.length) {
    frontmatter.topics = thought.metadata.topics
  }
  
  if (thought.metadata?.action_items?.length) {
    frontmatter.action_items = thought.metadata.action_items
  }
  
  // Add TSM framework mapping
  if (tsm) {
    frontmatter.tsm_stack = tsm.stack
    frontmatter.tsm_node = tsm.node
  }
  
  // Generate markdown content
  const content = `---
${Object.entries(frontmatter)
  .map(([key, value]) => {
    if (Array.isArray(value)) {
      return `${key}:\n${value.map(v => `  - "${v}"`).join('\n')}`
    }
    return `${key}: "${value}"`
  })
  .join('\n')}
---

${thought.content}

## Migrated From

- **Original ID**: ${thought.id}
- **Captured**: ${thought.created_at}
- **Template**: ${template || 'Uncategorized'}

## Related

<!-- Add wikilinks to related documents -->
`
  
  const filename = generateFilename(thought)
  const path = `${mapping.folder}/${filename}`
  
  return { path, content }
}

async function main() {
  const args = process.argv.slice(2)
  const inputFile = args.find((_, i) => args[i - 1] === '--input') || 'export.json'
  const outputDir = args.find((_, i) => args[i - 1] === '--output-dir') || './documents'
  
  console.log(`📖 Reading ${inputFile}...`)
  
  const json = await readFile(inputFile, 'utf-8')
  const data: ExportData = JSON.parse(json)
  
  console.log(`🔄 Transforming ${data.count} records...`)
  
  const results = []
  
  for (const record of data.records) {
    const { path, content } = transformToMarkdown(record)
    const fullPath = join(outputDir, path)
    
    // Ensure directory exists
    await mkdir(dirname(fullPath), { recursive: true })
    
    // Write file
    await writeFile(fullPath, content, 'utf-8')
    results.push(path)
  }
  
  console.log(`✅ Transformed ${results.length} documents:`)
  
  // Group by folder
  const byFolder = results.reduce((acc, path) => {
    const folder = path.split('/')[0]
    acc[folder] = (acc[folder] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  Object.entries(byFolder)
    .sort((a, b) => b[1] - a[1])
    .forEach(([folder, count]) => {
      console.log(`  ${folder}/: ${count} documents`)
    })
  
  console.log(`\n💾 Output directory: ${outputDir}`)
}

main().catch(console.error)
