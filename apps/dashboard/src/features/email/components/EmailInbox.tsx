'use client'

import { useState, useEffect } from 'react'
import { Mail, AlertCircle, Clock } from 'lucide-react'

interface EmailItem {
  id: string
  from_address: string
  subject: string
  received_at: string
  due_date: string | null
  template: string
  snippet: string
  daysWaiting: number
}

interface EmailData {
  actionRequired: EmailItem[]
  counts: {
    actionRequired: number
    overdue: number
    recentInbound: number
  }
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  )
}

function extractSenderName(fromAddress: string): string {
  const match = fromAddress.match(/^([^<]+)/)
  return match ? match[1].trim().replace(/^"(.+)"$/, '$1') : fromAddress
}

export function EmailInbox() {
  const [data, setData] = useState<EmailData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/emails')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <Card><div className="h-24 bg-gray-100 rounded-lg animate-pulse" /></Card>
  }

  if (!data || data.counts.actionRequired === 0) return null

  return (
    <Card className={data.counts.overdue > 0 ? 'border-red-200' : ''}>
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Mail className="w-4 h-4 text-gray-500" />
        Email ({data.counts.actionRequired} need action
        {data.counts.overdue > 0 && (
          <span className="inline-flex items-center gap-1 text-red-600">
            <AlertCircle className="w-3 h-3" />
            {data.counts.overdue} overdue
          </span>
        )}
        )
      </h3>

      <div className="space-y-3">
        {data.actionRequired.slice(0, 5).map(email => (
          <div
            key={email.id}
            className={`p-3 rounded-lg border ${
              email.daysWaiting >= 2
                ? 'border-red-100 bg-red-50'
                : 'border-gray-100 bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {extractSenderName(email.from_address)}
                </p>
                <p className="text-sm text-gray-700 truncate">{email.subject}</p>
                {email.snippet && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{email.snippet}</p>
                )}
              </div>
              <div className="flex-shrink-0 text-right">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    email.daysWaiting >= 2
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {email.daysWaiting === 0
                    ? 'today'
                    : email.daysWaiting === 1
                    ? '1d'
                    : `${email.daysWaiting}d`}
                </span>
                <p className="text-xs text-gray-400 mt-1">{email.template}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data.counts.recentInbound > 0 && (
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {data.counts.recentInbound} emails received in last 24h
        </p>
      )}
    </Card>
  )
}
