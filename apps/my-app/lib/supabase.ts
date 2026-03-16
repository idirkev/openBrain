import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Thought = {
  id: string
  content: string
  embedding: number[]
  metadata: {
    template?: string
    type?: string
    emoji?: string
    action_items?: string[]
    people?: string[]
    topics?: string[]
    source?: string
    created_at?: string
  }
  created_at: string
}

export async function getYesterdaysCaptures() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .gte('created_at', yesterday.toISOString())
    .lt('created_at', today.toISOString())
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Thought[]
}

export async function getOpenActionItems() {
  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .not('metadata->action_items', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return (data as Thought[]).filter(t => 
    t.metadata?.action_items && t.metadata.action_items.length > 0
  )
}

export async function getPeopleContext() {
  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .not('metadata->people', 'is', null)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw error
  
  const peopleMentions = new Map<string, { count: number; latest: Thought }>()
  
  ;(data as Thought[]).forEach(thought => {
    thought.metadata?.people?.forEach(person => {
      const existing = peopleMentions.get(person)
      if (!existing || new Date(thought.created_at) > new Date(existing.latest.created_at)) {
        peopleMentions.set(person, { 
          count: (existing?.count || 0) + 1, 
          latest: thought 
        })
      }
    })
  })
  
  return Array.from(peopleMentions.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
}

export async function getStats() {
  const { count: totalCount, error: totalError } = await supabase
    .from('thoughts')
    .select('*', { count: 'exact', head: true })

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const { count: weekCount, error: weekError } = await supabase
    .from('thoughts')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString())

  if (totalError || weekError) throw totalError || weekError
  
  return { total: totalCount || 0, thisWeek: weekCount || 0 }
}
