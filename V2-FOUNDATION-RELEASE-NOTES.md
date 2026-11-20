# LifeOS 2.0 — Foundation Release

**Focus:** Fix the original timing/zero-statistics problems and upgrade Copilot intent handling while preserving the stable Midnight frontend and existing cloud snapshot format.

### Ready in this build
- One-tap Complete marks a task completed without inventing work minutes.
- Start, Pause, Resume, and Complete store real timestamped active intervals and report observed duration separately.
- Overnight activities appear on both affected dates with planned-time slicing; known measured intervals and exact-interval legacy logs are split across local midnight.
- Local midnight triggers an automatic selected-day rollover when Today was being viewed.
- Dashboard cards now show Completed, Time scheduled, Time recorded, and Finished early, explicitly distinguishing timing evidence from schedule boundaries.
- Copilot supports plan/log/modify intent prompts, context-aware Worker messages and reviewable updates to existing activities. A generic-day fallback prevents a single meaningless “Plan my day” task.
- AI suggestions are not applied until approved and checked for obvious schedule conflicts.
- Existing 16 legacy categories, all personal data fields, Clerk auth and Cloudflare sync are retained. Shared Spaces are hidden, not deleted.

### Not implemented yet
13-domain adaptive analytics, full conversational memory, task dependencies, optimized multi-day reshuffling, field-level merge, automatic provider switching, and full data migration. Those require separate staged releases.

See `LIFEOS-V2-DEPLOY-GUIDE.md` for deployment order, limitations and acceptance tests.
