'use client'

import { useState, useEffect } from 'react'
import { 
  Brain, 
  Calendar, 
  CheckCircle, 
  Users,
  Sparkles,
  Sun,
  TrendingUp,
  Newspaper,
  Clock,
  ArrowRight,
  Zap
} from 'lucide-react'

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

interface GeminiBrief {
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

export default function MorningBriefing() {
  const [briefing, setBriefing] = useState<BriefingData | null>(null)
  const [geminiBrief, setGeminiBrief] = useState<GeminiBrief | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [briefingRes, geminiRes] = await Promise.all([
          fetch('/api/briefing'),
          fetch('/api/gemini-brief').catch(() => null)
        ])
        
        if (briefingRes.ok) {
          const briefingData = await briefingRes.json()
          setBriefing(briefingData)
        }
        
        if (geminiRes?.ok) {
          const geminiData = await geminiRes.json()
          setGeminiBrief(geminiData.brief)
        }
      } catch (err) {
        setError('Failed to load briefing data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const today = new Date()
  const formattedDate = today.toLocaleDateString('en-IE', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-8 h-8 text-indigo-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Loading your morning briefing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - idirnet style */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Brain className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Open Brain</h1>
                <p className="text-sm text-gray-500">Morning Briefing</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">{today.toLocaleDateString('en-IE', { weekday: 'long' })}</p>
              <p className="text-sm text-gray-500">{today.toLocaleDateString('en-IE', { month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats Row */}
        {briefing && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard 
              icon={<Brain className="w-4 h-4" />}
              label="Total Thoughts"
              value={briefing.summary.totalThoughts}
            />
            <StatCard 
              icon={<Calendar className="w-4 h-4" />}
              label="This Week"
              value={briefing.summary.thisWeek}
            />
            <StatCard 
              icon={<CheckCircle className="w-4 h-4" />}
              label="Yesterday"
              value={briefing.summary.yesterdaysCount}
            />
            <StatCard 
              icon={<Users className="w-4 h-4" />}
              label="Action Items"
              value={briefing.summary.openActionItems}
              highlight={briefing.summary.openActionItems > 5}
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Open Brain Data */}
          <div className="lg:col-span-2 space-y-6">
            <SectionHeader icon={<Brain className="w-5 h-5" />} title="Your Knowledge" />
            
            {/* Yesterday's Captures */}
            {briefing && briefing.yesterdaysCaptures.highlights.length > 0 && (
              <Card>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  Yesterday&apos;s Captures ({briefing.yesterdaysCaptures.total})
                </h3>
                <div className="space-y-3">
                  {briefing.yesterdaysCaptures.highlights.slice(0, 3).map((thought, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <span className="text-xs font-medium px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                          {thought.metadata?.template || 'Note'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                        {thought.content}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Action Items */}
            {briefing && briefing.actionItems.length > 0 && (
              <Card>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-500" />
                  Open Action Items ({briefing.actionItems.length})
                </h3>
                <div className="space-y-3">
                  {briefing.actionItems.slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{item.action}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.source}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* People Context */}
            {briefing && briefing.peopleContext.length > 0 && (
              <Card>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  People Context
                </h3>
                <div className="flex flex-wrap gap-2">
                  {briefing.peopleContext.slice(0, 8).map((person, i) => (
                    <span 
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm"
                    >
                      <span className="w-2 h-2 bg-indigo-500 rounded-full" />
                      {person.name}
                      <span className="text-indigo-400 text-xs">({person.mentions})</span>
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Today's Context */}
          <div className="space-y-6">
            <SectionHeader icon={<Calendar className="w-5 h-5" />} title="Today's Context" />
            
            {/* AI Morning Brief */}
            {geminiBrief && (
              <Card className="border-indigo-200">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-gray-900">AI Morning Brief</h3>
                </div>
                
                <p className="text-sm text-gray-700 bg-indigo-50 p-3 rounded-lg mb-4">
                  {geminiBrief.summary}
                </p>

                {/* Calendar Events */}
                {geminiBrief.calendar.events.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Schedule
                    </h4>
                    <div className="space-y-2">
                      {geminiBrief.calendar.events.slice(0, 4).map((event, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400 w-14">{event.time}</span>
                          <span className="flex-1 truncate">{event.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Priorities */}
                {geminiBrief.priorities.length > 0 && (
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Top Priorities
                    </h4>
                    <div className="space-y-2">
                      {geminiBrief.priorities.map((priority, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-xs flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm text-gray-700">{priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* Weather Widget */}
            <WeatherWidget />

            {/* Finance Ticker */}
            <FinanceTicker />

            {/* News Feed */}
            <NewsFeed />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>Open Brain — Morning Briefing Dashboard</p>
          <p className="mt-1">Built with Next.js, Supabase, and Gemini</p>
        </footer>
      </main>
    </div>
  )
}

// idirnet-style Components

function StatCard({ icon, label, value, highlight = false }: { 
  icon: React.ReactNode
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${highlight ? 'text-red-600' : 'text-gray-900'}`}>
        {value}
      </p>
    </div>
  )
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-900">
      {icon}
      <h2 className="text-base font-semibold">{title}</h2>
    </div>
  )
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}>
      {children}
    </div>
  )
}

// Widget Components

function WeatherWidget() {
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/weather')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setWeather(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <Card><div className="h-20 bg-gray-100 rounded-lg animate-pulse" /></Card>
  if (!weather) return null

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Sun className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-900">Weather</h3>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-gray-900">{Math.round(weather.main?.temp || 0)}°C</p>
          <p className="text-sm text-gray-500">{weather.name}</p>
        </div>
        <p className="text-sm text-gray-600 capitalize">{weather.weather?.[0]?.description}</p>
      </div>
    </Card>
  )
}

function FinanceTicker() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/finance')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <Card><div className="h-20 bg-gray-100 rounded-lg animate-pulse" /></Card>
  if (!data) return null

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-900">Clean Energy</h3>
      </div>
      <div className="space-y-2">
        {data.slice(0, 3).map((ticker: any, i: number) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">{ticker.symbol}</span>
            <span className={ticker.change >= 0 ? 'text-green-600' : 'text-red-600'}>
              {ticker.change >= 0 ? '+' : ''}{ticker.changePercent?.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function NewsFeed() {
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/news')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        setNews(data?.slice(0, 3) || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <Card><div className="h-20 bg-gray-100 rounded-lg animate-pulse" /></Card>
  if (news.length === 0) return null

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Newspaper className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-900">Good News</h3>
      </div>
      <div className="space-y-3">
        {news.map((item, i) => (
          <a 
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-gray-700 hover:text-indigo-600 line-clamp-2"
          >
            {item.title}
          </a>
        ))}
      </div>
    </Card>
  )
}
