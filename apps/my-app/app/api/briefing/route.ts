import { NextResponse } from 'next/server'
import { getYesterdaysCaptures, getOpenActionItems, getPeopleContext, getStats } from '@/lib/supabase'

export async function GET() {
  try {
    const [yesterdaysCaptures, actionItems, peopleContext, stats] = await Promise.all([
      getYesterdaysCaptures(),
      getOpenActionItems(),
      getPeopleContext(),
      getStats()
    ])

    // Group yesterday's captures by template
    const byTemplate = yesterdaysCaptures.reduce((acc, thought) => {
      const template = thought.metadata?.template || 'Uncategorized'
      if (!acc[template]) acc[template] = []
      acc[template].push(thought)
      return acc
    }, {} as Record<string, typeof yesterdaysCaptures>)

    // Extract action items from thoughts
    const allActionItems = actionItems.flatMap(t => 
      (t.metadata?.action_items || []).map(action => ({
        action,
        source: t.content.substring(0, 100) + '...',
        created: t.created_at,
        template: t.metadata?.template
      }))
    )

    return NextResponse.json({
      date: new Date().toISOString(),
      summary: {
        totalThoughts: stats.total,
        thisWeek: stats.thisWeek,
        yesterdaysCount: yesterdaysCaptures.length,
        openActionItems: allActionItems.length
      },
      yesterdaysCaptures: {
        total: yesterdaysCaptures.length,
        byTemplate,
        highlights: yesterdaysCaptures.slice(0, 5)
      },
      actionItems: allActionItems.slice(0, 10),
      peopleContext: peopleContext.map(([name, data]) => ({
        name,
        mentions: data.count,
        latestTopic: data.latest.content.substring(0, 80) + '...'
      })),
      // Placeholder for Gemini integration
      geminiBrief: null // Will be populated when Gemini Gem is configured
    })
  } catch (error) {
    console.error('Briefing fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to generate briefing' },
      { status: 500 }
    )
  }
}
