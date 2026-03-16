'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'

interface ActionItem {
  action: string
  source: string
  created: string
  template?: string
}

interface ActionItemsProps {
  items: ActionItem[]
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

export function ActionItems({ items }: ActionItemsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>Open Action Items</span>
          <Badge variant={items.length > 5 ? 'destructive' : 'secondary'}>
            {items.length} pending
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open action items</p>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {items.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox className="mt-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{TEMPLATE_EMOJIS[item.template || ''] || '📝'}</span>
                    {item.template && (
                      <Badge variant="outline" className="text-xs">
                        {item.template}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                    From: {item.source}
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
