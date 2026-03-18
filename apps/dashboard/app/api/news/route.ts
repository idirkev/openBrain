import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Good News Network RSS feed
    const response = await fetch(
      'https://www.goodnewsnetwork.org/feed/',
      { next: { revalidate: 3600 } } // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`)
    }

    const xml = await response.text()
    
    // Parse RSS XML
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || []
    
    const articles = items.slice(0, 5).map(item => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
                   item.match(/<title>(.*?)<\/title>/)?.[1] ||
                   'Untitled'
      
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
      
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
                         item.match(/<description>(.*?)<\/description>/)?.[1] ||
                         ''
      
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || ''
      
      return {
        title: title.replace(/<[^>]+>/g, ''), // Strip HTML
        link,
        description: description.replace(/<[^>]+>/g, '').substring(0, 200) + '...',
        published: pubDate
      }
    })

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('News fetch error:', error)
    // Return fallback good news
    return NextResponse.json({
      articles: [
        {
          title: 'Renewable Energy Hits Record High Globally',
          link: 'https://www.goodnewsnetwork.org',
          description: 'Solar and wind power continue to break records worldwide...',
          published: new Date().toISOString()
        }
      ]
    })
  }
}
