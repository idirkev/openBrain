'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, CheckCircle, AlertCircle, Calendar, Clock } from 'lucide-react'

interface ScheduledTask {
  action: string
  scheduledAt: string
  duration: number
  priority: 'high' | 'medium' | 'low'
  category: string
  reasoning: string
  success?: boolean
  error?: string
}

interface SmartScheduleResult {
  dryRun?: boolean
  proposedSchedule?: ScheduledTask[]
  schedule?: ScheduledTask[]
  results?: ScheduledTask[]
  message: string
  actions: number
  created?: number
}

export function SmartScheduleButton({ onSuccess }: { onSuccess?: () => void }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SmartScheduleResult | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  async function handleSmartSchedule(dryRun = true) {
    setLoading(true)
    try {
      const response = await fetch('/api/reclaim/smart-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate schedule')
      }

      setResult(data)
      setShowPreview(true)
      
      if (!dryRun && onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setResult({
        message: (err as Error).message,
        actions: 0,
        error: (err as Error).message
      } as SmartScheduleResult)
    } finally {
      setLoading(false)
    }
  }

  const tasks = result?.proposedSchedule || result?.schedule || result?.results || []

  return (
    <div className="space-y-4">
      {/* Smart Schedule Button */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200 hover:border-purple-300"
          onClick={() => handleSmartSchedule(true)}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
          )}
          Preview Smart Schedule
        </Button>
      </div>

      {/* Preview Results */}
      {showPreview && result && tasks.length > 0 && (
        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                {result.dryRun ? 'Proposed Schedule' : 'Scheduled Tasks'}
              </span>
              <Badge variant="secondary">
                {tasks.length} tasks
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Task List */}
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {tasks.map((task, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-lg border ${
                    task.success === false ? 'bg-red-50 border-red-200' : 
                    task.success === true ? 'bg-green-50 border-green-200' :
                    'bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">{task.action}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.scheduledAt).toLocaleDateString('en-IE', { 
                          weekday: 'short', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                        <span className="mx-1">•</span>
                        <Clock className="w-3 h-3" />
                        {task.duration}m
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {task.reasoning}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {task.priority}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{task.category}</span>
                      {task.success === true && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                      {task.success === false && (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  {task.error && (
                    <p className="text-xs text-red-600 mt-1">{task.error}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {result.dryRun && (
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={() => handleSmartSchedule(false)}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Apply Schedule
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPreview(false)}
                >
                  Dismiss
                </Button>
              </div>
            )}

            {!result.dryRun && (
              <div className="flex gap-2 pt-2 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowPreview(false)
                    if (onSuccess) onSuccess()
                  }}
                >
                  Done
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {result && (result as any).error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{(result as any).error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {showPreview && result && tasks.length === 0 && !result.error && (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">{result.message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
