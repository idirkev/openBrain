'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface Article {
  title: string
  link: string
  description: string
  published: string
}

export function NewsFeed() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch('/api/news')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setArticles(data.articles)
      } catch (err) {
        console.error('News fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Good News</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Good News Network</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {articles.map((article, i) => (
          <a
            key={i}
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <h4 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
              {article.title}
            </h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {article.description}
            </p>
          </a>
        ))}
      </CardContent>
    </Card>
  )
}
