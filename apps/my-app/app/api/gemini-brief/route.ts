import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'

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
  try {
    // Check if Gemini API key is configured
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Gemini API key not configured',
          setup: 'Add GEMINI_API_KEY to .env.local'
        },
        { status: 503 }
      )
    }

    // Get today's date for context
    const today = new Date()
    const dateStr = today.toLocaleDateString('en-IE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })

    // Build the prompt for Gemini
    const prompt = `You are the "Morning Brief" assistant for Open Brain. Generate a structured morning briefing for ${dateStr}.

Based on your access to Google Calendar, Gmail, and Google Drive, provide:

1. A 2-3 sentence summary of the day's outlook
2. Calendar events (meetings, focus time, personal items)
3. Priority emails that need attention
4. Recent Drive activity relevant to the user
5. Top 3 priorities for the day

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

Use your Google Workspace tools to fetch real data. If you cannot access certain data, provide realistic placeholder data that demonstrates the format and note it as "mock data" in the summary.

Respond ONLY with the JSON, no markdown formatting.`

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
      const error = await response.text()
      console.error('Gemini API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch from Gemini API', details: error },
        { status: 502 }
      )
    }

    const data = await response.json()
    
    // Extract the generated text
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!generatedText) {
      return NextResponse.json(
        { error: 'No content generated' },
        { status: 500 }
      )
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
      // Return the raw text if parsing fails
      return NextResponse.json({
        rawResponse: generatedText,
        error: 'Failed to parse structured data'
      })
    }

    return NextResponse.json({
      date: today.toISOString(),
      brief,
      source: 'gemini-2.5-flash'
    })

  } catch (error) {
    console.error('Gemini brief error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Gemini brief' },
      { status: 500 }
    )
  }
}
