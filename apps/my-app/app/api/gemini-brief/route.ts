import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role for server-side access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

// Type definitions for database entities
interface EmailItem {
  id: string
  message_id: string
  from_address: string
  from_name?: string
  to_address: string
  subject: string
  body_preview?: string
  received_at: string
  is_read: boolean
  action_required: boolean
  due_date?: string
  category?: string
  thread_id?: string
  user_id?: string
}

interface CalendarEvent {
  id: string
  event_id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  meet_link?: string
  attendees?: string[]
  is_recurring: boolean
  status: string
  user_id?: string
}

interface DriveFile {
  id: string
  file_id: string
  name: string
  mime_type: string
  web_view_link?: string
  modified_time: string
  created_time: string
  last_modifying_user?: string
  file_size?: number
  parent_folders?: string[]
  user_id?: string
}

interface GoogleTask {
  id: string
  task_id: string
  title: string
  notes?: string
  due_date?: string
  status: 'needsAction' | 'completed'
  completed?: string
  parent?: string
  position?: string
  task_list_id: string
  user_id?: string
}

interface Thought {
  id: string
  content: string
  embedding?: number[]
  metadata: {
    template?: string
    type?: string
    emoji?: string
    action_items?: string[]
    people?: string[]
    topics?: string[]
    source?: string
    created_at?: string
  }
  created_at: string
}

interface GeminiBrief {
  summary: string
  calendar: {
    events: Array<{
      title: string
      time: string
      type: 'meeting' | 'focus' | 'personal'
    }>
    conflicts: string[]
  }
  emails: {
    priority: Array<{
      from: string
      subject: string
      action: string
    }>
    needsReply: number
  }
  drive: {
    recentActivity: Array<{
      file: string
      type: 'edited' | 'commented' | 'shared'
      by: string
    }>
  }
  priorities: string[]
}

export async function GET() {
  const today = new Date()
  const dateStr = today.toLocaleDateString('en-IE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  try {
    // Calculate date ranges for queries
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    const todayStr = today.toISOString().split('T')[0]
    const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    // Fetch all data in parallel for efficiency
    const [
      priorityEmailsResult,
      calendarEventsResult,
      driveActivityResult,
      pendingTasksResult,
      recentCapturesResult
    ] = await Promise.all([
      // Fetch priority emails (action_required = true, last 24 hours)
      supabase
        .from('email_items')
        .select('*')
        .eq('action_required', true)
        .gte('received_at', yesterday.toISOString())
        .order('received_at', { ascending: false })
        .limit(10),

      // Fetch today's calendar events
      supabase
        .from('calendar_events')
        .select('*')
        .gte('start_time', `${todayStr}T00:00:00`)
        .lt('start_time', `${tomorrowStr}T00:00:00`)
        .order('start_time'),

      // Fetch recent Drive activity (last 24 hours)
      supabase
        .from('drive_files')
        .select('*')
        .gte('modified_time', yesterday.toISOString())
        .order('modified_time', { ascending: false })
        .limit(10),

      // Fetch pending tasks
      supabase
        .from('google_tasks')
        .select('*')
        .eq('status', 'needsAction')
        .order('due_date', { ascending: true })
        .limit(10),

      // Fetch recent Open Brain captures
      supabase
        .from('thoughts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
    ])

    // Extract data with proper typing
    const priorityEmails = priorityEmailsResult.data as EmailItem[] | null
    const calendarEvents = calendarEventsResult.data as CalendarEvent[] | null
    const driveActivity = driveActivityResult.data as DriveFile[] | null
    const pendingTasks = pendingTasksResult.data as GoogleTask[] | null
    const recentCaptures = recentCapturesResult.data as Thought[] | null

    // Check if we have any data at all
    const hasData = 
      (priorityEmails && priorityEmails.length > 0) ||
      (calendarEvents && calendarEvents.length > 0) ||
      (driveActivity && driveActivity.length > 0) ||
      (pendingTasks && pendingTasks.length > 0) ||
      (recentCaptures && recentCaptures.length > 0)

    // If no data exists yet, return setup instructions
    if (!hasData) {
      return NextResponse.json({
        date: today.toISOString(),
        formattedDate: dateStr,
        brief: {
          summary: "Welcome to your AI Morning Brief! Google Workspace sync is being set up. Once the integration is active, you'll see real emails, calendar events, tasks, and drive activity here.",
          calendar: { events: [], conflicts: [] },
          emails: { priority: [], needsReply: 0 },
          drive: { recentActivity: [] },
          priorities: []
        },
        source: 'setup-pending',
        setupInstructions: {
          step1: "Complete Google OAuth flow for the workspace services (Gmail, Calendar, Drive, Tasks)",
          step2: "Run initial sync to populate the database with historical data",
          step3: "Set up push notifications or scheduled polling to keep data fresh"
        },
        dataStatus: {
          emails: priorityEmailsResult.error ? 'error' : 'empty',
          calendar: calendarEventsResult.error ? 'error' : 'empty',
          drive: driveActivityResult.error ? 'error' : 'empty',
          tasks: pendingTasksResult.error ? 'error' : 'empty',
          captures: recentCapturesResult.error ? 'error' : 'empty'
        }
      })
    }

    // Build data summaries for the prompt
    const emailSummary = priorityEmails?.map(e => {
      const dueInfo = e.due_date ? `, Due: ${e.due_date}` : ''
      return `- From: ${e.from_name || e.from_address}, Subject: ${e.subject}${dueInfo}`
    }).join('\n') || 'No priority emails requiring action'

    const calendarSummary = calendarEvents?.map(e => {
      const time = new Date(e.start_time).toLocaleTimeString('en-IE', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Europe/Dublin'
      })
      const duration = Math.round(
        (new Date(e.end_time).getTime() - new Date(e.start_time).getTime()) / (1000 * 60)
      )
      const locationInfo = e.location ? ` @ ${e.location}` : ''
      const meetInfo = e.meet_link ? ' [Google Meet]' : ''
      return `- ${time} (${duration}m): ${e.title}${locationInfo}${meetInfo}`
    }).join('\n') || 'No events scheduled for today'

    const driveSummary = driveActivity?.map(f => {
      const modifiedBy = f.last_modifying_user || 'unknown'
      const fileType = f.mime_type?.includes('folder') ? 'folder' : 'file'
      return `- ${f.name} (${fileType}, modified by ${modifiedBy})`
    }).join('\n') || 'No Drive activity in the last 24 hours'

    const tasksSummary = pendingTasks?.map(t => {
      const dueInfo = t.due_date ? ` (due ${new Date(t.due_date).toLocaleDateString('en-IE')})` : ''
      return `- ${t.title}${dueInfo}`
    }).join('\n') || 'No pending tasks'

    const capturesSummary = recentCaptures?.map(c => {
      const template = c.metadata?.template || 'Note'
      const preview = c.content.length > 100 ? c.content.substring(0, 100) + '...' : c.content
      const time = new Date(c.created_at).toLocaleTimeString('en-IE', { 
        hour: '2-digit', 
        minute: '2-digit'
      })
      return `- [${template}] ${preview} (${time})`
    }).join('\n') || 'No recent captures'

    // Check if Gemini API key is configured
    if (!GEMINI_API_KEY) {
      // Return raw data without AI summary if no API key
      return NextResponse.json({
        date: today.toISOString(),
        formattedDate: dateStr,
        brief: {
          summary: "Here's your data (AI summary unavailable - no Gemini API key configured)",
          calendar: {
            events: calendarEvents?.map(e => ({
              title: e.title,
              time: new Date(e.start_time).toLocaleTimeString('en-IE', { 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'Europe/Dublin'
              }),
              type: e.title.toLowerCase().includes('focus') || e.title.toLowerCase().includes('deep work') 
                ? 'focus' 
                : e.title.toLowerCase().includes('lunch') || e.title.toLowerCase().includes('gym')
                  ? 'personal'
                  : 'meeting' as const
            })) || [],
            conflicts: []
          },
          emails: {
            priority: priorityEmails?.map(e => ({
              from: e.from_name || e.from_address,
              subject: e.subject,
              action: e.due_date ? `Reply by ${e.due_date}` : 'Reply needed'
            })) || [],
            needsReply: priorityEmails?.length || 0
          },
          drive: {
            recentActivity: driveActivity?.map(f => ({
              file: f.name,
              type: 'edited' as const,
              by: f.last_modifying_user || 'unknown'
            })) || []
          },
          priorities: pendingTasks?.slice(0, 3).map(t => t.title) || []
        },
        source: 'raw-data',
        rawData: {
          emails: priorityEmails,
          calendar: calendarEvents,
          drive: driveActivity,
          tasks: pendingTasks,
          captures: recentCaptures
        }
      })
    }

    // Build the enhanced prompt with real data
    const prompt = `You are the "Morning Brief" assistant for Open Brain. Generate a structured morning briefing for ${dateStr}.

**REAL DATA FROM KEV'S GOOGLE WORKSPACE:**

**Priority Emails (needing action):**
${emailSummary}

**Today's Calendar Events:**
${calendarSummary}

**Recent Drive Activity (last 24h):**
${driveSummary}

**Pending Tasks:**
${tasksSummary}

**Recent Open Brain Captures:**
${capturesSummary}

Based on this real data, provide:
1. A 2-3 sentence summary of the day's outlook (mention key meetings, urgent emails, and overall vibe)
2. Calendar events with times and any conflicts (check for back-to-back meetings)
3. Priority emails that need attention (flag any with due dates)
4. Drive activity relevant to today's meetings (if any files were edited by others)
5. Top 3 priorities for the day based on due dates, meetings, and urgent emails

Format your response as valid JSON with this exact structure:
{
  "summary": "Brief overview of the day",
  "calendar": {
    "events": [
      {"title": "Event name", "time": "9:00 AM", "type": "meeting"}
    ],
    "conflicts": ["Any scheduling conflicts"]
  },
  "emails": {
    "priority": [
      {"from": "Sender", "subject": "Subject line", "action": "What to do"}
    ],
    "needsReply": 3
  },
  "drive": {
    "recentActivity": [
      {"file": "Filename", "type": "edited", "by": "Person"}
    ]
  },
  "priorities": ["Priority 1", "Priority 2", "Priority 3"]
}

Respond ONLY with the JSON, no markdown formatting. Ensure the JSON is valid and parseable.`

    // Call Gemini API
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      
      // Return raw data with error info if Gemini fails
      return NextResponse.json({
        date: today.toISOString(),
        formattedDate: dateStr,
        brief: {
          summary: "Here's your data (AI summary unavailable due to API error)",
          calendar: {
            events: calendarEvents?.map(e => ({
              title: e.title,
              time: new Date(e.start_time).toLocaleTimeString('en-IE', { 
                hour: '2-digit', 
                minute: '2-digit'
              }),
              type: 'meeting' as const
            })) || [],
            conflicts: []
          },
          emails: {
            priority: priorityEmails?.map(e => ({
              from: e.from_name || e.from_address,
              subject: e.subject,
              action: 'Reply needed'
            })) || [],
            needsReply: priorityEmails?.length || 0
          },
          drive: {
            recentActivity: driveActivity?.map(f => ({
              file: f.name,
              type: 'edited' as const,
              by: f.last_modifying_user || 'unknown'
            })) || []
          },
          priorities: pendingTasks?.slice(0, 3).map(t => t.title) || []
        },
        source: 'raw-data',
        error: 'Gemini API error',
        errorDetails: errorText
      })
    }

    const data = await response.json()
    
    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!generatedText) {
      return NextResponse.json({
        date: today.toISOString(),
        formattedDate: dateStr,
        brief: {
          summary: "Here's your data (AI summary unavailable - no content generated)",
          calendar: {
            events: calendarEvents?.map(e => ({
              title: e.title,
              time: new Date(e.start_time).toLocaleTimeString('en-IE', { 
                hour: '2-digit', 
                minute: '2-digit'
              }),
              type: 'meeting' as const
            })) || [],
            conflicts: []
          },
          emails: {
            priority: priorityEmails?.map(e => ({
              from: e.from_name || e.from_address,
              subject: e.subject,
              action: 'Reply needed'
            })) || [],
            needsReply: priorityEmails?.length || 0
          },
          drive: {
            recentActivity: driveActivity?.map(f => ({
              file: f.name,
              type: 'edited' as const,
              by: f.last_modifying_user || 'unknown'
            })) || []
          },
          priorities: pendingTasks?.slice(0, 3).map(t => t.title) || []
        },
        source: 'raw-data',
        error: 'No content generated by Gemini'
      })
    }

    // Parse the JSON response (handle potential markdown code blocks)
    let brief: GeminiBrief
    try {
      const jsonMatch = generatedText.match(/```json\n?([\s\S]*?)\n?```/) || 
                        generatedText.match(/```\n?([\s\S]*?)\n?```/) ||
                        [null, generatedText]
      const jsonStr = jsonMatch[1] || generatedText
      brief = JSON.parse(jsonStr.trim())
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', generatedText)
      // Return raw text if parsing fails, but still include the data
      return NextResponse.json({
        date: today.toISOString(),
        formattedDate: dateStr,
        brief: {
          summary: "Here's your data (AI summary had formatting issues)",
          calendar: {
            events: calendarEvents?.map(e => ({
              title: e.title,
              time: new Date(e.start_time).toLocaleTimeString('en-IE', { 
                hour: '2-digit', 
                minute: '2-digit'
              }),
              type: 'meeting' as const
            })) || [],
            conflicts: []
          },
          emails: {
            priority: priorityEmails?.map(e => ({
              from: e.from_name || e.from_address,
              subject: e.subject,
              action: 'Reply needed'
            })) || [],
            needsReply: priorityEmails?.length || 0
          },
          drive: {
            recentActivity: driveActivity?.map(f => ({
              file: f.name,
              type: 'edited' as const,
              by: f.last_modifying_user || 'unknown'
            })) || []
          },
          priorities: pendingTasks?.slice(0, 3).map(t => t.title) || []
        },
        source: 'raw-data',
        rawResponse: generatedText,
        error: 'Failed to parse structured data from Gemini'
      })
    }

    return NextResponse.json({
      date: today.toISOString(),
      formattedDate: dateStr,
      brief,
      source: 'gemini-2.5-flash',
      dataStats: {
        emailsFetched: priorityEmails?.length || 0,
        eventsFetched: calendarEvents?.length || 0,
        driveFilesFetched: driveActivity?.length || 0,
        tasksFetched: pendingTasks?.length || 0,
        capturesFetched: recentCaptures?.length || 0
      }
    })

  } catch (error) {
    console.error('Gemini brief error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate Gemini brief',
        details: error instanceof Error ? error.message : String(error),
        date: today.toISOString(),
        formattedDate: dateStr
      },
      { status: 500 }
    )
  }
}
