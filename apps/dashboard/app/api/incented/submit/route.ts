import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

const INCENTED_API_URL = 'https://api.incented.co/v1'
const INCENTED_API_KEY = process.env.INCENTED_API_KEY

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { thoughtId, programId } = body

    if (!thoughtId || !programId) {
      return NextResponse.json(
        { error: 'Missing thoughtId or programId' },
        { status: 400 }
      )
    }

    // Fetch thought from Supabase
    const { data: thought, error: thoughtError } = await supabase
      .from('thoughts')
      .select('*')
      .eq('id', thoughtId)
      .single()

    if (thoughtError || !thought) {
      return NextResponse.json(
        { error: 'Thought not found' },
        { status: 404 }
      )
    }

    // Check if already submitted to Incented
    if (thought.metadata?.incented_submission_id) {
      return NextResponse.json(
        { error: 'Thought already submitted to Incented', submissionId: thought.metadata.incented_submission_id },
        { status: 409 }
      )
    }

    // Prepare submission for Incented
    const submission = {
      title: `[Open Brain] ${thought.metadata?.template || 'Thought'}: ${thought.content.substring(0, 80)}...`,
      description: thought.content,
      metadata: {
        openBrainThoughtId: thought.id,
        template: thought.metadata?.template,
        type: thought.metadata?.type,
        topics: thought.metadata?.topics,
        people: thought.metadata?.people,
        originalCreatedAt: thought.created_at,
      },
      externalId: thought.id,
    }

    // Submit to Incented API
    let incentedResponse
    if (INCENTED_API_KEY) {
      const response = await fetch(`${INCENTED_API_URL}/programs/${programId}/submissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${INCENTED_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Incented API error:', error)
        return NextResponse.json(
          { error: 'Failed to submit to Incented', details: error },
          { status: 502 }
        )
      }

      incentedResponse = await response.json()
    } else {
      // Mock response for development
      incentedResponse = {
        id: `mock-${Date.now()}`,
        status: 'pending',
        programId,
        submittedAt: new Date().toISOString(),
      }
    }

    // Update thought with Incented metadata
    const updatedMetadata = {
      ...thought.metadata,
      incented_submission_id: incentedResponse.id,
      incented_program_id: programId,
      incented_status: 'submitted',
      incented_submitted_at: new Date().toISOString(),
    }

    await supabase
      .from('thoughts')
      .update({ metadata: updatedMetadata })
      .eq('id', thoughtId)

    return NextResponse.json({
      success: true,
      submission: incentedResponse,
      thoughtId,
      programId,
    })

  } catch (error) {
    console.error('Incented submit error:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/incented/submit',
    description: 'Submit Open Brain thoughts to Incented incentive programs',
    method: 'POST',
    body: {
      thoughtId: 'string - UUID of the thought to submit',
      programId: 'string - Incented program ID',
    },
    configured: !!process.env.INCENTED_API_KEY,
  })
}
