'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  Calendar, 
  Mail, 
  FileText, 
  Target, 
  AlertCircle,
  RefreshCw,
  Clock,
  User,
  FileEdit,
  MessageSquare,
  Share2
} from 'lucide-react'

interface GeminiBriefData {
  date: string
  brief: {
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
  source: string
}

export function GeminiBrief() {
  const [brief, setBrief] = useState<GeminiBriefData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  async function fetchBrief() {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/gemini-brief')
      
      if (!response.ok) {
        const data = await response.json()
        if (response.status === 503) {
          setError('Gemini API not configured. Add GEMINI_API_KEY to .env.local')
        } else {
          setError(data.error || 'Failed to fetch Gemini brief')
        }
        return
      }
      
      const data = await response.json()
      setBrief(data)
    } catch (err) {
      setError('Failed to load Gemini brief')
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }

  useEffect(() => {
    fetchBrief()
  }, [])

  const handleRetry = () => {
    setRetrying(true)
    fetchBrief()
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <User className="w-4 h-4" />
      case 'focus': return <Clock className="w-4 h-4" />
      case 'personal': return <Calendar className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800'
      case 'focus': return 'bg-purple-100 text-purple-800'
      case 'personal': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDriveIcon = (type: string) => {
    switch (type) {
      case 'edited': return <FileEdit className="w-4 h-4" />
      case 'commented': return <MessageSquare className="w-4 h-4" />
      case 'shared': return <Share2 className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">AI Morning Brief</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">AI Morning Brief</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              disabled={retrying}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Retrying...' : 'Retry'}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!brief) return null

  const { brief: data } = brief

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">AI Morning Brief</CardTitle>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRetry}
            disabled={retrying}
          >
            <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="bg-primary/5 rounded-lg p-4">
          <p className="text-sm leading-relaxed">{data.summary}</p>
        </div>

        {/* Calendar Events */}
        {data.calendar.events.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Today&apos;s Schedule
            </h4>
            <div className="space-y-2">
              {data.calendar.events.map((event, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                >
                  <span className="text-xs font-medium text-muted-foreground w-16">
                    {event.time}
                  </span>
                  <span className={getEventIcon(event.type)} />
                  <span className="text-sm flex-1">{event.title}</span>
                  <Badge variant="secondary" className={`text-xs ${getEventColor(event.type)}`}>
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
            {data.calendar.conflicts.length > 0 && (
              <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {data.calendar.conflicts[0]}
              </div>
            )}
          </div>
        )}

        {/* Priority Emails */}
        {data.emails.priority.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              Priority Emails
              {data.emails.needsReply > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {data.emails.needsReply} need reply
                </Badge>
              )}
            </h4>
            <div className="space-y-2">
              {data.emails.priority.slice(0, 3).map((email, i) => (
                <div 
                  key={i} 
                  className="p-2 rounded-lg bg-muted/50 text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{email.from}</span>
                  </div>
                  <p className="text-muted-foreground text-xs mb-1">{email.subject}</p>
                  <p className="text-xs text-primary">{email.action}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drive Activity */}
        {data.drive.recentActivity.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Drive Activity
            </h4>
            <div className="space-y-2">
              {data.drive.recentActivity.slice(0, 3).map((activity, i) => (
                <div 
                  key={i} 
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm"
                >
                  {getDriveIcon(activity.type)}
                  <span className="flex-1 truncate">{activity.file}</span>
                  <span className="text-xs text-muted-foreground">by {activity.by}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Priorities */}
        {data.priorities.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              Today&apos;s Priorities
            </h4>
            <div className="space-y-2">
              {data.priorities.map((priority, i) => (
                <div 
                  key={i} 
                  className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm pt-0.5">{priority}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Generated by {brief.source}
        </div>
      </CardContent>
    </Card>
  )
}
