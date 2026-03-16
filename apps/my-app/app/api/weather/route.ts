import { NextResponse } from 'next/server'

const DUBLIN_LAT = 53.3498
const DUBLIN_LON = -6.2603

export async function GET() {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Weather API key not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${DUBLIN_LAT}&lon=${DUBLIN_LON}&appid=${apiKey}&units=metric`,
      { next: { revalidate: 300 } } // Cache for 5 minutes
    )

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json({
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      location: 'Dublin'
    })
  } catch (error) {
    console.error('Weather fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weather' },
      { status: 500 }
    )
  }
}
