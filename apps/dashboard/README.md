# Open Brain — Morning Briefing Dashboard

A single-page daily summary optimized for mobile, built with Next.js and shadcn/ui.

## Features

- **Stats Overview**: Total thoughts, this week's captures, yesterday's count, open action items
- **Yesterday's Captures**: Grouped by template with highlights
- **Action Items**: Checklist of pending actions from your thoughts
- **People Context**: Recent mentions and context
- **Weather**: Dublin weather via OpenWeather API
- **Clean Energy ETFs**: ICLN, TAN, PBW, QCLN tickers
- **Good News**: Positive news feed from Good News Network
- **Gemini Brief** (coming soon): Calendar, Gmail, Drive integration

## Setup

1. Copy environment variables:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in your API keys:
   - Supabase credentials from your project
   - OpenWeather API key
   - Gemini API key (for Morning Brief feature)

3. Run locally:
   ```bash
   npm run dev
   ```

4. Deploy to Vercel:
   ```bash
   vercel
   ```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for server) |
| `OPENWEATHER_API_KEY` | OpenWeather API key |
| `GEMINI_API_KEY` | Google Gemini API key |

## API Routes

- `/api/weather` - Dublin weather data
- `/api/news` - Good News Network RSS feed
- `/api/finance` - Clean energy ETF prices
- `/api/briefing` - Combined Open Brain data

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui
- Supabase Client
- date-fns
