# Reclaim.ai Integration for Open Brain

## What Reclaim Does

- **Smart scheduling**: Automatically finds time for tasks, habits, and meetings
- **Calendar sync**: Blocks time based on priority and availability
- **Task integration**: Connects to Todoist, Asana, Jira, Linear
- **Habit scheduling**: Recurring time blocks (e.g., "Morning Review")
- **Buffer time**: Auto-adds breaks between meetings
- **Analytics**: Shows where time goes

## Integration Approaches

### Option 1: Reclaim API (Direct Integration)

Reclaim has a public API in beta. We can:

```typescript
// Create tasks from Open Brain action items
POST https://api.reclaim.ai/api/tasks
{
  "title": "Follow up with Laura about Budget",
  "notes": "From: Decision: Allocate Q2 budget...",
  "duration": 30,  // minutes
  "priority": "high",
  "due": "2026-03-20",
  "category": "Work" // Maps to Reclaim categories
}
```

**Pros:** Native integration, automatic scheduling
**Cons:** API is beta, requires Reclaim subscription

### Option 2: Google Calendar as Bridge (Recommended)

Reclaim already syncs with Google Calendar. We can:

1. **Create calendar events** from Open Brain action items
2. **Use specific titles** Reclaim recognizes (e.g., "[Task] Review contract")
3. **Set visibility** so Reclaim can parse and schedule

```typescript
// Google Calendar API
POST /calendar/v3/calendars/primary/events
{
  "summary": "[Open Brain] Action: Review stakeholder feedback",
  "description": "Captured: Stakeholder: New partner requirements...",
  "start": { "dateTime": "2026-03-17T10:00:00" },
  "end": { "dateTime": "2026-03-17T11:00:00" },
  "extendedProperties": {
    "private": {
      "openBrainSource": "thought_id_xyz",
      "template": "Stakeholder"
    }
  }
}
```

**Pros:** No Reclaim API needed, works with existing setup
**Cons:** Less control over scheduling logic

### Option 3: Task Manager Bridge

Reclaim integrates with Todoist/Asana. Flow:

```
Open Brain action item
    ↓
Google Apps Script (or Edge Function)
    ↓
Create task in Todoist
    ↓
Reclaim auto-syncs and schedules
```

**Pros:** Proven pattern, Reclaim handles scheduling
**Cons:** Extra service dependency

## Implementation Plan

### Phase A: Calendar Events from Action Items

Add to `meeting-notes` or new `schedule-actions` Edge Function:

```typescript
// When action items are extracted from transcripts
if (thought.metadata?.action_items?.length > 0) {
  for (const action of thought.metadata.action_items) {
    await createCalendarEvent({
      title: `[Action] ${action}`,
      description: `From: ${thought.content.substring(0, 200)}...`,
      durationEstimate: 30, // Could be LLM-estimated
      sourceThoughtId: thought.id
    })
  }
}
```

### Phase B: Morning Briefing + Reclaim

Enhance the dashboard to show:

```typescript
// Fetch from Reclaim API (or Google Calendar if using bridge)
interface ReclaimData {
  scheduledTasks: Array<{
    title: string
    scheduledStart: string
    scheduledEnd: string
    priority: 'high' | 'medium' | 'low'
    category: string
  }>
  habits: Array<{
    title: string
    scheduledTime: string
    streak: number
  }>
  freeTimeBlocks: Array<{
    start: string
    end: string
    durationMinutes: number
  }>
}
```

### Phase C: Smart Scheduling Suggestions

```typescript
// In Morning Briefing API
const suggestions = {
  // Find action items without calendar time
  unscheduledActions: actionItems.filter(a => !a.scheduledTime),
  
  // Suggest when to schedule based on Reclaim free blocks
  suggestedSlots: reclaimData.freeTimeBlocks
    .filter(block => block.durationMinutes >= 30)
    .slice(0, 3),
    
  // Habits to maintain
  habitReminders: reclaimData.habits
    .filter(h => h.title.includes('Review') || h.title.includes('Planning'))
}
```

## Google Apps Script Integration

```javascript
// Add to existing Open Brain Apps Script
function syncActionItemsToCalendar() {
  const actions = fetchUnscheduledActionsFromSupabase();
  
  actions.forEach(action => {
    CalendarApp.createEvent(
      `[Open Brain] ${action.title}`,
      new Date(action.suggestedTime),
      new Date(action.suggestedTime + action.duration * 60000),
      {
        description: `Source: ${action.sourceThought}`,
        location: action.isVirtual ? 'Virtual' : undefined
      }
    );
  });
}

// Run every morning at 7am
triggers.createTimeDrivenTrigger(syncActionItemsToCalendar)
  .everyDays(1)
  .atHour(7);
```

## Reclaim Categories ↔ Open Brain Templates

Map Open Brain templates to Reclaim task categories:

| Open Brain Template | Reclaim Category | Auto-schedule? |
|---------------------|------------------|----------------|
| Decision | Strategic | Yes, priority high |
| Risk | Urgent | Yes, priority high |
| Milestone | Planning | Yes, this week |
| Spec | Deep Work | Yes, 2hr blocks |
| Meeting Debrief | Admin | Buffer time after |
| Stakeholder | Communication | Flex time |
| Invoice | Admin | Morning slots |
| Compliance | Urgent | ASAP |

## API Requirements

### If Using Reclaim API

```bash
# Get API key from Reclaim settings
curl -H "Authorization: Bearer $RECLAIM_API_KEY" \
  https://api.reclaim.ai/api/tasks
```

### If Using Google Calendar Bridge

Already have Apps Script setup — just extend it.

### Environment Variables

Add to `.env.local`:

```
# Option 1: Reclaim API
RECLAIM_API_KEY=your_key
RECLAIM_BASE_URL=https://api.reclaim.ai/api

# Option 2: Google Calendar (already have)
GOOGLE_CALENDAR_ID=primary

# Option 3: Task Manager bridge
TODOIST_API_KEY=your_key
```

## Dashboard Updates

Add Reclaim section to Morning Briefing:

```tsx
// app/components/ReclaimSchedule.tsx
<Card>
  <CardHeader>
    <CardTitle>📅 Today's Schedule (via Reclaim)</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      {reclaimTasks.map(task => (
        <div key={task.id} className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full" 
               style={{ backgroundColor: task.color }} />
          <span className="text-sm font-medium">{task.title}</span>
          <span className="text-xs text-muted-foreground">
            {formatTime(task.start)} - {formatTime(task.end)}
          </span>
        </div>
      ))}
    </div>
    
    {unscheduledActions.length > 0 && (
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm font-medium mb-2">
          ⚡ Suggested scheduling
        </p>
        <Button onClick={autoSchedule}>
          Schedule {unscheduledActions.length} actions
        </Button>
      </div>
    )}
  </CardContent>
</Card>
```

## Recommended Approach

**Start with Option 2 (Google Calendar bridge)** because:

1. You already have Google Apps Script for Open Brain
2. No additional API keys needed
3. Reclaim will automatically pick up events
4. Can iterate to Option 1 later

**Next steps:**
1. Extend `meeting-notes` Edge Function to create calendar events for action items
2. Add Reclaim section to Morning Briefing dashboard
3. Test with a few action items
4. Consider Reclaim API for deeper integration
