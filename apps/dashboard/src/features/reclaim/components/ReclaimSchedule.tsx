'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { format, parseISO } from 'date-fns'
import { Calendar, Clock, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import { SmartScheduleButton } from './SmartScheduleButton'

interface ReclaimTask {
  id: string
  title: string
  notes?: string
  duration: number
  priority: 'high' | 'medium' | 'low'
  category: string
  due?: string
  scheduled?: string
}

interface ReclaimEvent {
  id: string
  title: string
  start: string
  end: string
  category: string
}

interface ActionItem {
  thoughtId: string
  action: string
  template: string
  source: string
}

interface ReclaimData {
  unscheduled: ActionItem[]
  reclaimTasks: ReclaimTask[]
  reclaimScheduled: ReclaimEvent[]
  categories: Record<string, { category: string; priority: string; duration: number }>
}

const PRIORITY_COLORS = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
}

const TEMPLATE_EMOJIS: Record<string, string> = {
  'Decision': '🎯',
  'Risk': '⚠️',
  'Milestone': '🏁',
  'Spec': '🔧',
  'Meeting Debrief': '📋',
  'Stakeholder': '🤝',
  'Sent': '📤',
  'Budget': '💰',
  'Invoice': '🧾',
  'Funding': '💵',
  'Legal': '⚖️',
  'Compliance': '✅',
  'Contract': '📄',
  'Insight': '💡',
  'AI Save': '🤖',
}

export function ReclaimSchedule() {
  const [data, setData] = useState<ReclaimData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scheduling, setScheduling] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReclaimData() {
      try {
        const response = await fetch('/api/reclaim')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setData(data)
      } catch (err) {
        setError('Reclaim integration not configured')
      } finally {
        setLoading(false)
      }
    }

    fetchReclaimData()
  }, [])

  async function handleSchedule(method: 'google-calendar' | 'reclaim' | 'todoist', thoughtId: string, actionIndex: number) {
    setScheduling(`${thoughtId}-${actionIndex}`)
    try {
      const response = await fetch('/api/reclaim/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'schedule-one',
          thoughtId,
          actionIndex,
          method,
        }),
      })
      
      if (!response.ok) throw new Error('Schedule failed')
      
      // Refresh data
      const refreshResponse = await fetch('/api/reclaim')
      if (refreshResponse.ok) {
        const newData = await refreshResponse.json()
        setData(newData)
      }
    } catch (err) {
      alert('Failed to schedule. Check console for details.')
    } finally {
      setScheduling(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">📅 Reclaim Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">📅 Reclaim Integration</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Connect Reclaim to auto-schedule Open Brain action items.
          </p>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Three options:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Google Calendar bridge (easiest)</li>
              <li>Reclaim API direct</li>
              <li>Todoist bridge</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    )
  }

  const today = new Date().toISOString().split('T')[0]
  const todaysEvents = data.reclaimScheduled.filter(e => e.start.startsWith(today))

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Reclaim Schedule
          </span>
          <Badge variant="outline">{data.reclaimTasks.length} tasks</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Schedule */}
        {todaysEvents.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Today
            </h4>
            <div className="space-y-2">
              {todaysEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(event.start), 'h:mm a')} - {format(parseISO(event.end), 'h:mm a')}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs shrink-0">
                    {event.category}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Smart Schedule with Gemini */}
        {data.unscheduled.length > 0 && (
          <SmartScheduleButton onSuccess={() => {
            // Refresh data after scheduling
            fetch('/api/reclaim')
              .then(r => r.ok ? r.json() : null)
              .then(newData => newData && setData(newData))
          }} />
        )}

        {/* Unscheduled Actions */}
        {data.unscheduled.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Unscheduled Actions ({data.unscheduled.length})
            </h4>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {data.unscheduled.slice(0, 5).map((item, index) => (
                <div key={`${item.thoughtId}-${index}`} className="p-2 rounded-lg border">
                  <div className="flex items-start gap-2">
                    <span className="text-sm">{TEMPLATE_EMOJIS[item.template] || '📝'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{item.action}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {item.source}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      disabled={scheduling === `${item.thoughtId}-${index}`}
                      onClick={() => handleSchedule('google-calendar', item.thoughtId, index)}
                    >
                      {scheduling === `${item.thoughtId}-${index}` ? '...' : '📅 GCal'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7"
                      disabled={scheduling === `${item.thoughtId}-${index}`}
                      onClick={() => handleSchedule('reclaim', item.thoughtId, index)}
                    >
                      ⚡ Reclaim
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {data.unscheduled.length > 5 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                +{data.unscheduled.length - 5} more actions
              </p>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <p className="text-lg font-bold">{data.reclaimTasks.length}</p>
            <p className="text-xs text-muted-foreground">Tasks</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{data.reclaimScheduled.length}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{data.unscheduled.length}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
