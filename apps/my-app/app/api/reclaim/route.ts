import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

// Template to Reclaim category mapping (must match Edge Function)
const TEMPLATE_CATEGORIES: Record<string, { category: string; priority: 'high' | 'medium' | 'low'; duration: number }> = {
  'Decision': { category: 'Strategic', priority: 'high', duration: 30 },
  'Risk': { category: 'Urgent', priority: 'high', duration: 45 },
  'Milestone': { category: 'Planning', priority: 'medium', duration: 30 },
  'Spec': { category: 'Deep Work', priority: 'medium', duration: 120 },
  'Meeting Debrief': { category: 'Admin', priority: 'low', duration: 15 },
  'Stakeholder': { category: 'Communication', priority: 'medium', duration: 30 },
  'Sent': { category: 'Admin', priority: 'low', duration: 15 },
  'Budget': { category: 'Finance', priority: 'high', duration: 60 },
  'Invoice': { category: 'Admin', priority: 'medium', duration: 30 },
  'Funding': { category: 'Strategic', priority: 'high', duration: 60 },
  'Legal': { category: 'Urgent', priority: 'high', duration: 60 },
  'Compliance': { category: 'Urgent', priority: 'high', duration: 45 },
  'Contract': { category: 'Strategic', priority: 'high', duration: 60 },
  'Insight': { category: 'Deep Work', priority: 'low', duration: 30 },
  'AI Save': { category: 'Reference', priority: 'low', duration: 15 },
}

interface ActionItem {
  thoughtId: string
  content: string
  action: string
  template: string
  source: string
  createdAt: string
}

async function getUnscheduledActions(limit = 10): Promise<ActionItem[]> {
  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .not('metadata->action_items', 'is', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error

  const actions: ActionItem[] = []
  
  for (const thought of data || []) {
    const actionItems = thought.metadata?.action_items || []
    const template = thought.metadata?.template || 'Note'
    const scheduledActions = thought.metadata?.scheduled_actions || []
    const scheduledSet = new Set(scheduledActions.map((s: any) => s.action))
    
    for (let i = 0; i < actionItems.length; i++) {
      const action = actionItems[i]
      // Skip already scheduled actions
      if (scheduledSet.has(action)) continue
      
      actions.push({
        thoughtId: thought.id,
        content: thought.content,
        action,
        template,
        source: thought.content.substring(0, 100) + '...',
        createdAt: thought.created_at,
      })
    }
  }

  return actions.slice(0, limit)
}

async function getReclaimTasks(): Promise<any[]> {
  const reclaimKey = process.env.RECLAIM_API_KEY
  if (!reclaimKey) return []

  try {
    const response = await fetch('https://api.reclaim.ai/api/tasks', {
      headers: { 'Authorization': `Bearer ${reclaimKey}` },
      next: { revalidate: 300 }
    })

    if (!response.ok) return []
    
    const tasks = await response.json()
    return tasks.filter((t: any) => 
      t.notes?.includes('Open Brain') || t.notes?.includes('openBrain')
    )
  } catch {
    return []
  }
}

async function getReclaimScheduled(): Promise<any[]> {
  const reclaimKey = process.env.RECLAIM_API_KEY
  if (!reclaimKey) return []

  try {
    const today = new Date().toISOString().split('T')[0]
    const response = await fetch(
      `https://api.reclaim.ai/api/planned?start=${today}&days=7`,
      {
        headers: { 'Authorization': `Bearer ${reclaimKey}` },
        next: { revalidate: 300 }
      }
    )

    if (!response.ok) return []
    return await response.json()
  } catch {
    return []
  }
}

export async function GET() {
  try {
    const [unscheduled, reclaimTasks, reclaimScheduled] = await Promise.all([
      getUnscheduledActions(20),
      getReclaimTasks(),
      getReclaimScheduled(),
    ])

    return NextResponse.json({
      unscheduled,
      reclaimTasks,
      reclaimScheduled,
      categories: TEMPLATE_CATEGORIES,
    })
  } catch (error) {
    console.error('Reclaim API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Reclaim data' },
      { status: 500 }
    )
  }
}
