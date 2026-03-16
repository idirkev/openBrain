'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { WeatherWidget } from './components/WeatherWidget'
import { NewsFeed } from './components/NewsFeed'
import { FinanceTicker } from './components/FinanceTicker'
import { CapturesList } from './components/CapturesList'
import { ActionItems } from './components/ActionItems'
import { PeopleContext } from './components/PeopleContext'
import { ReclaimSchedule } from './components/ReclaimSchedule'
import { Brain, Calendar, CheckCircle, Users } from 'lucide-react'

interface BriefingData {
  date: string
  summary: {
    totalThoughts: number
    thisWeek: number
    yesterdaysCount: number
    openActionItems: number
  }
  yesterdaysCaptures: {
    total: number
    byTemplate: Record<string, any[]>
    highlights: any[]
  }
  actionItems: any[]
  peopleContext: any[]
}

export default function MorningBriefing() {
  const [briefing, setBriefing] = useState<BriefingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBriefing() {
      try {
        const response = await fetch('/api/briefing')
        if (!response.ok) throw new Error('Failed to fetch briefing')
        const data = await response.json()
        setBriefing(data)
      } catch (err) {
        setError('Failed to load briefing data')
      } finally {
        setLoading(false)
      }
    }

    fetchBriefing()
  }, [])

  const today = new Date()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Open Brain</h1>
                <p className="text-xs text-muted-foreground">Morning Briefing</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{format(today, 'EEEE')}</p>
              <p className="text-sm text-muted-foreground">{format(today, 'MMMM d, yyyy')}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Row */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : briefing ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Total Thoughts</span>
                </div>
                <p className="text-2xl font-bold mt-2">{briefing.summary.totalThoughts}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">This Week</span>
                </div>
                <p className="text-2xl font-bold mt-2">{briefing.summary.thisWeek}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Yesterday</span>
                </div>
                <p className="text-2xl font-bold mt-2">{briefing.summary.yesterdaysCount}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Action Items</span>
                </div>
                <p className={`text-2xl font-bold mt-2 ${briefing.summary.openActionItems > 5 ? 'text-destructive' : ''}`}>
                  {briefing.summary.openActionItems}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Open Brain Data */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Your Knowledge
            </h2>
            
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : briefing ? (
              <>
                <CapturesList captures={briefing.yesterdaysCaptures} />
                <ActionItems items={briefing.actionItems} />
                <PeopleContext people={briefing.peopleContext} />
              </>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Failed to load briefing data
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - External Data */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today&apos;s Context
            </h2>
            
            <WeatherWidget />
            <FinanceTicker />
            <NewsFeed />
            
            {/* Reclaim Schedule Integration */}
            <ReclaimSchedule />
          </div>
        </div>

        <Separator className="my-8" />

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground pb-8">
          <p>Open Brain — Morning Briefing Dashboard</p>
          <p className="mt-1">Built with Next.js, Supabase, and OpenRouter</p>
        </footer>
      </main>
    </div>
  )
}
