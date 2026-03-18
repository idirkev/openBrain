import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const reclaimKey = process.env.RECLAIM_API_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// Template to Reclaim category mapping
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

async function markActionScheduled(thoughtId: string, action: string, scheduledAt: string) {
  const { data: thought } = await supabase
    .from('thoughts')
    .select('metadata')
    .eq('id', thoughtId)
    .single()

  if (!thought) return

  const metadata = thought.metadata || {}
  const scheduledActions = metadata.scheduled_actions || []
  
  scheduledActions.push({
    action,
    scheduledAt,
    createdAt: new Date().toISOString(),
  })

  await supabase
    .from('thoughts')
    .update({
      metadata: { ...metadata, scheduled_actions: scheduledActions }
    })
    .eq('id', thoughtId)
}

async function createReclaimTask(
  action: string,
  template: string,
  source: string,
  thoughtId: string
) {
  if (!reclaimKey) {
    return { success: false, error: 'Reclaim API key not configured' }
  }

  try {
    const config = TEMPLATE_CATEGORIES[template] || { category: 'Work', priority: 'medium', duration: 30 }
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    const response = await fetch('https://api.reclaim.ai/api/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${reclaimKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: action,
        notes: `Source: ${source}\n\nTemplate: ${template}\nOpen Brain thought: ${thoughtId}`,
        duration: config.duration,
        priority: config.priority,
        due: dueDate,
        category: config.category,
        autoSchedule: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error }
    }

    const data = await response.json()
    await markActionScheduled(thoughtId, action, dueDate)
    
    return { success: true, taskId: data.id }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

async function createGoogleCalendarEvent(
  action: string,
  template: string,
  source: string,
  thoughtId: string,
  accessToken: string
) {
  try {
    const config = TEMPLATE_CATEGORIES[template] || { category: 'Work', priority: 'medium', duration: 30 }
    
    const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000)
    startTime.setMinutes(0, 0, 0)
    startTime.setHours(startTime.getHours() + 1)
    
    const endTime = new Date(startTime.getTime() + config.duration * 60 * 1000)

    const event = {
      summary: `[Open Brain] ${action}`,
      description: `Source: ${source}\n\nTemplate: ${template}\nThought ID: ${thoughtId}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Europe/Dublin',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Europe/Dublin',
      },
      extendedProperties: {
        private: {
          openBrainSource: thoughtId,
          openBrainTemplate: template,
          openBrainAction: action,
          reclaimCategory: config.category,
          reclaimPriority: config.priority,
        },
      },
      transparency: 'transparent',
      colorId: config.priority === 'high' ? '11' : config.priority === 'medium' ? '5' : '7',
    }

    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error }
    }

    const data = await response.json()
    await markActionScheduled(thoughtId, action, startTime.toISOString())
    
    return { success: true, eventId: data.id }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      action,
      thoughtId,
      actionIndex,
      method,
      googleAccessToken,
    } = body

    if (action !== 'schedule-one' || !thoughtId || actionIndex === undefined || !method) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get the thought
    const { data: thought } = await supabase
      .from('thoughts')
      .select('*')
      .eq('id', thoughtId)
      .single()

    if (!thought?.metadata?.action_items?.[actionIndex]) {
      return NextResponse.json(
        { error: 'Action item not found' },
        { status: 404 }
      )
    }

    const actionText = thought.metadata.action_items[actionIndex]
    const template = thought.metadata?.template || 'Note'
    const source = thought.content.substring(0, 100) + '...'

    let result
    switch (method) {
      case 'reclaim':
        result = await createReclaimTask(actionText, template, source, thoughtId)
        break
      case 'google-calendar':
        if (!googleAccessToken) {
          return NextResponse.json(
            { error: 'Missing Google access token' },
            { status: 400 }
          )
        }
        result = await createGoogleCalendarEvent(actionText, template, source, thoughtId, googleAccessToken)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid method' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: result.success,
      method,
      action: actionText,
      result,
    })
  } catch (error) {
    console.error('Schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule action' },
      { status: 500 }
    )
  }
}
