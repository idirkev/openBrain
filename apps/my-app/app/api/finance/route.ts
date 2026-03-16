import { NextResponse } from 'next/server'

const TICKERS = ['ICLN', 'TAN', 'PBW', 'QCLN']

export async function GET() {
  try {
    const results = await Promise.all(
      TICKERS.map(async (ticker) => {
        try {
          const response = await fetch(
            `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=2d`,
            { next: { revalidate: 300 } } // Cache for 5 minutes
          )

          if (!response.ok) {
            throw new Error(`Yahoo Finance error for ${ticker}: ${response.status}`)
          }

          const data = await response.json()
          const result = data.chart?.result?.[0]
          
          if (!result) {
            return { ticker, error: 'No data available' }
          }

          const meta = result.meta
          const timestamps = result.timestamp
          const closes = result.indicators?.quote?.[0]?.close
          
          if (!closes || closes.length < 2) {
            return { ticker, error: 'Insufficient data' }
          }

          const currentPrice = closes[closes.length - 1]
          const previousPrice = closes[0]
          const change = currentPrice - previousPrice
          const changePercent = (change / previousPrice) * 100

          return {
            ticker,
            name: meta.shortName || meta.longName || ticker,
            price: currentPrice.toFixed(2),
            change: change.toFixed(2),
            changePercent: changePercent.toFixed(2),
            currency: meta.currency || 'USD'
          }
        } catch (error) {
          console.error(`Error fetching ${ticker}:`, error)
          return { ticker, error: 'Failed to fetch' }
        }
      })
    )

    return NextResponse.json({ tickers: results })
  } catch (error) {
    console.error('Finance fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch finance data' },
      { status: 500 }
    )
  }
}
