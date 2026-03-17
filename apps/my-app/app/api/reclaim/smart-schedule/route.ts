import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const RECLAIM_API_KEY = process.env.RECLAIM_API_KEY || ''
const MCP_ACCESS_KEY = process.env.MCP_ACCESS_KEY || ''
const SUPABASE_FUNCTIONS_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1`
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

interface ActionItem {
  thoughtId: string
  content: string
  action: string
  template: string
  source: string
  createdAt: string
}

interface ScheduledTask {
  action: string
  thoughtId: string
  scheduledAt: string
  duration: number
  priority: 'high' | 'medium' | 'low'
  category: string
  reasoning: string
}

// Fetch unscheduled actions from the main Reclaim API
async function getUnscheduledActions(): Promise<ActionItem[]> {
  try {
    const response = await fetch(
      `${SUPABASE_FUNCTIONS_URL}/schedule-actions`,
      { headers: { 'x-brain-key': MCP_ACCESS_KEY } }
    )
    if (!response.ok) return []
    const data = await response.json()
    return data.unscheduled || []
  } catch {
    return []
  }
}

// Fetch current Reclaim schedule
async function getReclaimSchedule(): Promise<any[]> {
  if (!RECLAIM_API_KEY) return []
  
  try {
    const today = new Date().toISOString().split('T')[0]
    const response = await fetch(
      `https://api.reclaim.ai/api/planned?start=${today}&days=7`,
      { headers: { 'Authorization': `Bearer ${RECLAIM_API_KEY}` } }
    )
    if (!response.ok) return []
    return await response.json()
  } catch {
    return []
  }
}

// Use Gemini to intelligently schedule tasks
async function generateSmartSchedule(
  actions: ActionItem[],
  existingSchedule: any[]
): Promise<ScheduledTask[]> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured')
  }

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-IE', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  })

  // Template to category/priority mapping
  const templateConfig: Record<string, { category: string; priority: 'high' | 'medium' | 'low'; duration: number }> = {
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

  const prompt = `You are a smart scheduling assistant. Today is ${dateStr}.

I have ${actions.length} unscheduled tasks from my Open Brain knowledge system and my current calendar.

**UNSCHEDULED TASKS:**
${actions.map((a, i) => `
${i + 1}. [${a.template}] ${a.action}
   Source: ${a.source.substring(0, 100)}
   Template: ${a.template}
`).join('\n')}

**CURRENT SCHEDULE (next 7 days):**
${existingSchedule.slice(0, 10).map(e => `- ${e.title}: ${e.start} to ${e.end}`).join('\n')}

**YOUR TASK:**
Create an optimal schedule for these tasks. Consider:
1. High priority items (Risk, Legal, Compliance, Decision) should be scheduled first
2. Deep Work items need 2+ hour blocks, preferably in morning
3. Admin items can fill gaps between meetings
4. Don't schedule over existing commitments
5. Spread tasks across the week to avoid overload

For each task, provide:
- When to schedule it (ISO datetime)
- Duration in minutes
- Priority level
- Category
- Brief reasoning

Respond with ONLY valid JSON in this exact format:
{
  "schedule": [
    {
      "action": "Exact action text",
      "thoughtId": "${actions[0]?.thoughtId || 'example-id'}",
      "scheduledAt": "2026-03-17T09:00:00Z",
      "duration": 30,
      "priority": "high",
      "category": "Strategic",
      "reasoning": "Scheduled morning for high-priority decision"
    }
  ]
}

IMPORTANT: Return ONLY the JSON, no markdown, no explanations.`

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 }
    })
  })

  if (!response.ok) {
    throw new Error(`Gemini API error: ${await response.text()}`)
  }

  const data = await response.json()
  const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!generatedText) {
    throw new Error('No content generated')
  }

  // Parse JSON response
  try {
    const jsonMatch = generatedText.match(/```json\n?([\s\S]*?)\n?```/) || 
                      generatedText.match(/```\n?([\s\S]*?)\n?```/) ||
                      [null, generatedText]
    const jsonStr = jsonMatch[1] || generatedText
    const parsed = JSON.parse(jsonStr.trim())
    return parsed.schedule || []
  } catch (parseError) {
    console.error('Failed to parse Gemini response:', generatedText)
    throw new Error('Failed to parse schedule')
  }
}

// Create Reclaim task
async function createReclaimTask(task: ScheduledTask): Promise<{ success: boolean; taskId?: string; error?: string }> {
  if (!RECLAIM_API_KEY) {
    return { success: false, error: 'Reclaim API key not configured' }
  }

  try {
    const response = await fetch('https://api.reclaim.ai/api/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RECLAIM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: task.action,
        notes: `Smart scheduled by Gemini\nPriority: ${task.priority}\nReasoning: ${task.reasoning}`,
        duration: task.duration,
        priority: task.priority,
        due: task.scheduledAt.split('T')[0],
        category: task.category,
        autoSchedule: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return { success: false, error }
    }

    const data = await response.json()
    return { success: true, taskId: data.id }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

// Mark action as scheduled in Supabase
async function markActionScheduled(thoughtId: string, action: string, scheduledAt: string) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    // Fetch current metadata
    const response = await fetch(`${supabaseUrl}/rest/v1/thoughts?id=eq.${thoughtId}&select=metadata`, {
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      }
    })
    
    if (!response.ok) return
    
    const data = await response.json()
    const metadata = data[0]?.metadata || {}
    const scheduledActions = metadata.scheduled_actions || []
    
    scheduledActions.push({
      action,
      scheduledAt,
      createdAt: new Date().toISOString(),
      source: 'gemini-smart-scheduler'
    })
    
    // Update metadata
    await fetch(`${supabaseUrl}/rest/v1/thoughts?id=eq.${thoughtId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ metadata: { ...metadata, scheduled_actions: scheduledActions } })
    })
  } catch (err) {
    console.error('Failed to mark action scheduled:', err)
  }
}

export async function POST(request: Request) {
  try {
    const { dryRun = false } = await request.json()

    // Check API keys
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 503 }
      )
    }

    // Fetch data
    const [actions, schedule] = await Promise.all([
      getUnscheduledActions(),
      getReclaimSchedule()
    ])

    if (actions.length === 0) {
      return NextResponse.json({
        message: 'No unscheduled actions found',
        schedule: [],
        actions: 0,
        created: 0
      })
    }

    // Generate smart schedule with Gemini
    const smartSchedule = await generateSmartSchedule(actions, schedule)

    // If dry run, just return the proposed schedule
    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        proposedSchedule: smartSchedule,
        actions: actions.length,
        message: `Proposed schedule for ${smartSchedule.length} tasks`
      })
    }

    // Create Reclaim tasks
    const results = []
    for (const task of smartSchedule) {
      const result = await createReclaimTask(task)
      
      if (result.success) {
        // Mark as scheduled in Supabase
        await markActionScheduled(task.thoughtId, task.action, task.scheduledAt)
      }
      
      results.push({
        action: task.action,
        scheduledAt: task.scheduledAt,
        success: result.success,
        taskId: result.taskId,
        error: result.error,
        reasoning: task.reasoning
      })
    }

    return NextResponse.json({
      message: `Scheduled ${results.filter(r => r.success).length} of ${results.length} tasks`,
      schedule: smartSchedule,
      results,
      actions: actions.length,
      created: results.filter(r => r.success).length
    })

  } catch (error) {
    console.error('Smart schedule error:', error)
    return NextResponse.json(
      { error: 'Failed to generate smart schedule', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return configuration info
  return NextResponse.json({
    configured: {
      gemini: !!GEMINI_API_KEY,
      reclaim: !!RECLAIM_API_KEY
    },
    description: 'Smart scheduler uses Gemini to intelligently schedule Open Brain action items in Reclaim',
    endpoints: {
      POST: '/api/reclaim/smart-schedule',
      body: { dryRun: 'boolean (optional) - preview without creating tasks' }
    }
  })
}
