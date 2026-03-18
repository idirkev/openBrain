import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const WEBHOOK_SECRET = process.env.INCENTED_WEBHOOK_SECRET

interface IncentedWebhookPayload {
  event: 'submission.voted' | 'submission.won' | 'submission.lost' | 'voting.completed'
  submissionId: string
  programId: string
  data: {
    thoughtId?: string
    votes?: {
      for: number
      against: number
      total: number
    }
    reward?: {
      amount: number
      token: string
    }
    rank?: number
    status?: 'won' | 'lost' | 'pending'
  }
}

export async function POST(request: Request) {
  try {
    // Verify webhook signature if configured
    const signature = request.headers.get('x-incented-signature')
    
    if (WEBHOOK_SECRET && signature) {
      // In production, verify HMAC signature
      // const isValid = verifySignature(await request.text(), signature, WEBHOOK_SECRET)
      // if (!isValid) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload: IncentedWebhookPayload = await request.json()
    
    console.log('Incented webhook received:', payload.event, payload.submissionId)

    // Find thought by submission ID
    const { data: thought, error: findError } = await supabase
      .from('thoughts')
      .select('*')
      .eq('metadata->incented_submission_id', payload.submissionId)
      .single()

    if (findError || !thought) {
      console.error('Thought not found for submission:', payload.submissionId)
      return NextResponse.json({ error: 'Thought not found' }, { status: 404 })
    }

    // Update thought based on event type
    const metadata = thought.metadata || {}
    
    switch (payload.event) {
      case 'submission.voted':
        metadata.incented_votes = payload.data.votes
        metadata.incented_last_vote_at = new Date().toISOString()
        break
        
      case 'submission.won':
        metadata.incented_status = 'won'
        metadata.incented_reward = payload.data.reward
        metadata.incented_rank = payload.data.rank
        metadata.incented_completed_at = new Date().toISOString()
        break
        
      case 'submission.lost':
        metadata.incented_status = 'lost'
        metadata.incented_votes = payload.data.votes
        metadata.incented_completed_at = new Date().toISOString()
        break
        
      case 'voting.completed':
        metadata.incented_status = payload.data.status
        metadata.incented_votes = payload.data.votes
        metadata.incented_completed_at = new Date().toISOString()
        break
    }

    // Update thought
    await supabase
      .from('thoughts')
      .update({ metadata })
      .eq('id', thought.id)

    // If won, could trigger additional actions:
    // - Notify user
    // - Post to Slack
    // - Update leaderboard
    
    if (payload.event === 'submission.won' && payload.data.reward) {
      // Post win to Slack
      await notifySlack(thought, payload.data)
    }

    return NextResponse.json({ 
      success: true, 
      thoughtId: thought.id,
      event: payload.event 
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

async function notifySlack(thought: any, data: any) {
  const slackWebhook = process.env.SLACK_WEBHOOK_URL
  if (!slackWebhook) return

  try {
    await fetch(slackWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🎉 Incented Win!`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*🎉 Knowledge Contribution Rewarded!*\n\nA thought has won in the Incented program:\n\n>*${thought.content.substring(0, 100)}...*\n\n• Template: ${thought.metadata?.template || 'Note'}\n• Reward: ${data.reward?.amount} ${data.reward?.token}\n• Rank: #${data.rank}`
            }
          }
        ]
      })
    })
  } catch (err) {
    console.error('Slack notification failed:', err)
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/incented/webhook',
    description: 'Receive Incented voting results and update thoughts',
    method: 'POST',
    events: ['submission.voted', 'submission.won', 'submission.lost', 'voting.completed'],
    configured: !!process.env.INCENTED_WEBHOOK_SECRET,
  })
}
