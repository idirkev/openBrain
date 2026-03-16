#!/usr/bin/env tsx
/**
 * Export Open Brain data for migration
 * 
 * Usage:
 *   export SUPABASE_URL=...
 *   export SUPABASE_SERVICE_ROLE_KEY=...
 *   npx tsx export-data.ts --template Decision --output decisions.json
 */

import { createClient } from '@supabase/supabase-js'
import { writeFile } from 'fs/promises'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ExportOptions {
  template?: string
  type?: string
  since?: string
  limit?: number
  output: string
}

async function parseArgs(): Promise<ExportOptions> {
  const args = process.argv.slice(2)
  const options: Partial<ExportOptions> = { output: 'export.json' }
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--template':
        options.template = args[++i]
        break
      case '--type':
        options.type = args[++i]
        break
      case '--since':
        options.since = args[++i]
        break
      case '--limit':
        options.limit = parseInt(args[++i])
        break
      case '--output':
        options.output = args[++i]
        break
      case '--help':
        console.log(`
Export Open Brain data for migration

Options:
  --template <name>    Filter by template (Decision, Risk, etc.)
  --type <type>        Filter by type (task, idea, observation, etc.)
  --since <date>       Export records since date (YYYY-MM-DD)
  --limit <n>          Limit number of records
  --output <file>      Output file (default: export.json)
  --help               Show this help

Examples:
  npx tsx export-data.ts --template Decision --output decisions.json
  npx tsx export-data.ts --since 2024-01-01 --limit 100
        `)
        process.exit(0)
    }
  }
  
  return options as ExportOptions
}

async function exportData(options: ExportOptions) {
  console.log('🔍 Querying thoughts table...')
  
  let query = supabase
    .from('thoughts')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (options.template) {
    query = query.eq('metadata->>template', options.template)
    console.log(`  Filter: template = "${options.template}"`)
  }
  
  if (options.type) {
    query = query.eq('metadata->>type', options.type)
    console.log(`  Filter: type = "${options.type}"`)
  }
  
  if (options.since) {
    query = query.gte('created_at', options.since)
    console.log(`  Filter: since = "${options.since}"`)
  }
  
  if (options.limit) {
    query = query.limit(options.limit)
    console.log(`  Limit: ${options.limit}`)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('❌ Export failed:', error.message)
    process.exit(1)
  }
  
  console.log(`✅ Found ${data?.length || 0} records`)
  
  // Add export metadata
  const exportData = {
    exported_at: new Date().toISOString(),
    filters: {
      template: options.template,
      type: options.type,
      since: options.since
    },
    count: data?.length || 0,
    records: data
  }
  
  await writeFile(options.output, JSON.stringify(exportData, null, 2))
  console.log(`💾 Written to ${options.output}`)
  
  // Summary by template
  if (!options.template && data) {
    const byTemplate = data.reduce((acc, record) => {
      const template = record.metadata?.template || 'uncategorized'
      acc[template] = (acc[template] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    console.log('\n📊 Records by template:')
    Object.entries(byTemplate)
      .sort((a, b) => b[1] - a[1])
      .forEach(([template, count]) => {
        console.log(`  ${template}: ${count}`)
      })
  }
}

async function main() {
  const options = await parseArgs()
  await exportData(options)
}

main().catch(console.error)
