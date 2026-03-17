'use client'

import { useState } from 'react'
import { Trophy, Clock, CheckCircle, XCircle, ExternalLink, Loader2 } from 'lucide-react'

interface IncentedStatusProps {
  thoughtId: string
  metadata?: {
    incented_submission_id?: string
    incented_status?: 'submitted' | 'voting' | 'won' | 'lost'
    incented_votes?: {
      for: number
      against: number
      total: number
    }
    incented_reward?: {
      amount: number
      token: string
    }
    incented_rank?: number
  }
  programId?: string
  onSubmit?: () => void
}

export function IncentedStatus({ 
  thoughtId, 
  metadata, 
  programId = '7b4cd3fb-63c4-40c2-8ede-4175ca6e1ac5',
  onSubmit 
}: IncentedStatusProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!programId) return
    
    setSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/incented/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thoughtId, programId }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit')
      }
      
      if (onSubmit) onSubmit()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  // Not submitted yet - show submit button
  if (!metadata?.incented_submission_id) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trophy className="w-4 h-4" />
          )}
          Submit for Rewards
        </button>
        {error && (
          <span className="text-xs text-red-600">{error}</span>
        )}
      </div>
    )
  }

  // Submitted - show status
  const status = metadata.incented_status || 'submitted'
  const votes = metadata.incented_votes
  const reward = metadata.incented_reward

  return (
    <div className="flex items-center gap-3">
      {/* Status Badge */}
      <StatusBadge status={status} />
      
      {/* Vote Count */}
      {votes && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <span className="text-green-600 font-medium">+{votes.for}</span>
          <span className="text-gray-400">/</span>
          <span className="text-red-600 font-medium">-{votes.against}</span>
          <span className="text-gray-400 text-xs">({votes.total} votes)</span>
        </div>
      )}
      
      {/* Reward */}
      {status === 'won' && reward && (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <Trophy className="w-3 h-3" />
          {reward.amount} {reward.token}
          {metadata.incented_rank && (
            <span className="text-green-600 text-xs">#{metadata.incented_rank}</span>
          )}
        </div>
      )}
      
      {/* Link to Incented */}
      <a
        href={`https://incented.co/details/${programId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-gray-600"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const configs = {
    submitted: {
      icon: <Clock className="w-3 h-3" />,
      text: 'Pending',
      className: 'bg-yellow-50 text-yellow-700',
    },
    voting: {
      icon: <Clock className="w-3 h-3" />,
      text: 'Voting',
      className: 'bg-blue-50 text-blue-700',
    },
    won: {
      icon: <CheckCircle className="w-3 h-3" />,
      text: 'Won',
      className: 'bg-green-50 text-green-700',
    },
    lost: {
      icon: <XCircle className="w-3 h-3" />,
      text: 'Not Selected',
      className: 'bg-gray-100 text-gray-600',
    },
  }

  const config = configs[status as keyof typeof configs] || configs.submitted

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.icon}
      {config.text}
    </span>
  )
}
