'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface TickerData {
  ticker: string
  name: string
  price: string
  change: string
  changePercent: string
  currency: string
  error?: string
}

export function FinanceTicker() {
  const [tickers, setTickers] = useState<TickerData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFinance() {
      try {
        const response = await fetch('/api/finance')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setTickers(data.tickers.filter((t: TickerData) => !t.error))
      } catch (err) {
        console.error('Finance fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFinance()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Clean Energy ETFs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Clean Energy ETFs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tickers.map((ticker) => {
          const isPositive = parseFloat(ticker.changePercent) >= 0
          return (
            <div key={ticker.ticker} className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{ticker.ticker}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {ticker.name}
                  </span>
                </div>
                <div className="text-lg font-semibold">
                  {ticker.price} {ticker.currency}
                </div>
              </div>
              <Badge variant={isPositive ? 'default' : 'destructive'} className="gap-1">
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{ticker.changePercent}%
              </Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
