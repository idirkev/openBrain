import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role to bypass RLS for internal dashboard queries
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const fortyEightHoursAgo = new Date()
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48)

    const [actionResult, overdueResult, recentResult] = await Promise.all([
      // Action-required emails, ordered by urgency
      supabase
        .from('email_items')
        .select('id, from_address, subject, received_at, due_date, template, snippet')
        .eq('action_required', true)
        .order('received_at', { ascending: true })
        .limit(10),

      // Overdue: action-required and waiting > 48h
      supabase
        .from('email_items')
        .select('id, from_address, subject, received_at, template', { count: 'exact' })
        .eq('action_required', true)
        .lt('received_at', fortyEightHoursAgo.toISOString()),

      // Recent emails (last 24h) for context
      supabase
        .from('email_items')
        .select('id, from_address, subject, received_at, template', { count: 'exact' })
        .gte('received_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
    ])

    const actionEmails = actionResult.data || []
    const overdueCount = overdueResult.count || 0
    const recentCount = recentResult.count || 0

    // Compute days waiting for each action email
    const now = Date.now()
    const enriched = actionEmails.map(email => ({
      ...email,
      daysWaiting: Math.floor((now - new Date(email.received_at).getTime()) / (1000 * 60 * 60 * 24)),
    }))

    return NextResponse.json({
      actionRequired: enriched,
      counts: {
        actionRequired: actionEmails.length,
        overdue: overdueCount,
        recentInbound: recentCount,
      },
    })
  } catch (error) {
    console.error('Email fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 })
  }
}
