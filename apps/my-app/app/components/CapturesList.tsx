'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface Thought {
  id: string
  content: string
  metadata: {
    template?: string
    emoji?: string
    type?: string
  }
  created_at: string
}

interface CapturesListProps {
  captures: {
    total: number
    byTemplate: Record<string, Thought[]>
    highlights: Thought[]
  }
}

const TEMPLATE_EMOJIS: Record<string, string> = {
  'Decision': '🎯',
  'Risk': '⚠️',
  'Milestone': '🏁',
  'Spec': '🔧',
  'Meeting Debrief': '📋',
  'Person Note': '👤',
  'Stakeholder': '🤝',
  'Sent': '📤',
  'Budget': '💰',
  'Invoice': '🧾',
  'Funding': '💵',
  'Legal': '⚖️',
  'Compliance': '✅',
  'Contract': '📄',
  'Insight': '💡',
  'AI Save': '🤖',
  'Nutrition': '🥗',
  'Health': '❤️',
  'Home': '🏠'
}

export function CapturesList({ captures }: CapturesListProps) {
  const templates = Object.entries(captures.byTemplate)
    .sort((a, b) => b[1].length - a[1].length)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Yesterday&apos;s Captures</span>
          <Badge variant="secondary">{captures.total} total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No captures yesterday</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {templates.map(([template, items]) => (
                <Badge key={template} variant="outline" className="gap-1">
                  <span>{TEMPLATE_EMOJIS[template] || '📝'}</span>
                  <span>{template}</span>
                  <span className="ml-1 text-muted-foreground">({items.length})</span>
                </Badge>
              ))}
            </div>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Recent Highlights
              </h4>
              {captures.highlights.map((thought) => (
                <div key={thought.id} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{TEMPLATE_EMOJIS[thought.metadata?.template || ''] || '📝'}</span>
                    <Badge variant="secondary" className="text-xs">
                      {thought.metadata?.template || 'Note'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">
                    {thought.content}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
