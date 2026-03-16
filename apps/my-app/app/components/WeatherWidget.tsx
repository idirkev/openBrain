'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface WeatherData {
  temp: number
  feelsLike: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
  location: string
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchWeather() {
      try {
        const response = await fetch('/api/weather')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setWeather(data)
      } catch (err) {
        setError('Weather unavailable')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error || !weather) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error || 'Weather data unavailable'}</p>
        </CardContent>
      </Card>
    )
  }

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{weather.location}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <img src={iconUrl} alt={weather.description} className="w-16 h-16" />
          <div>
            <div className="text-3xl font-bold">{weather.temp}°C</div>
            <div className="text-sm text-muted-foreground capitalize">{weather.description}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Feels like {weather.feelsLike}°C • Humidity {weather.humidity}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
