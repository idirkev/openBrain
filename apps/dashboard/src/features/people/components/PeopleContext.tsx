'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface PersonContext {
  name: string
  mentions: number
  latestTopic: string
}

interface PeopleContextProps {
  people: PersonContext[]
}

export function PeopleContext({ people }: PeopleContextProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>People Context</span>
          <Badge variant="secondary">{people.length} active</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {people.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent people mentions</p>
        ) : (
          <div className="space-y-3">
            {people.map((person) => (
              <div key={person.name} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium shrink-0">
                  {person.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{person.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {person.mentions} mentions
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    {person.latestTopic}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
