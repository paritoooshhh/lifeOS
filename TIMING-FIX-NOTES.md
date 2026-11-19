# LifeOS v1.2.1 timing fix

- Overnight activities now support `endDate` while retaining the existing `date`, `start`, `end` fields.
- Rescheduling past midnight moves subsequent activities to the next calendar day.
- Planner shows the end date for cross-day activities.
- Progress and planned duration use actual date-aware durations.
- The service worker cache version was incremented.
- Shared Spaces, Clerk, AI, and Worker integration are unchanged.

Test: Nov 20 23:30–Nov 21 00:30; reshuffle two 60-minute tasks from 23:30 with a 10-minute break; cancel preview; refresh and cloud sync.

Note: this patch does not add a continuously updating clock or automatically switch the manually selected dashboard date at midnight.
