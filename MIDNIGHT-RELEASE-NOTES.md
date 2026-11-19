# LifeOS Midnight v1.1 — UI-only upgrade

## What changed
- Apple Health-inspired Midnight palette and card system.
- Balanced Home dashboard with real completion ring, next planned activity, recorded focus metrics, and timeline.
- Desktop navigation becomes a fixed sidebar at 1000px and wider.
- Mobile retains all six existing destinations in a safe-area-aware bottom bar.
- Cache identifier bumped so the PWA refreshes its assets.

## What did not change
- Clerk sign-in and sign-out code.
- Cloudflare Worker endpoint and credentials in config.js.
- D1 schema, sync revisions, data keys, AI planner, and form fields.

## Deploy
Upload the files inside this folder to the ROOT of your existing GitHub Pages repository. Do not upload the enclosing folder itself. Wait for GitHub Pages to publish, then close/reopen the iPhone PWA if it still shows the old design.

## Test
1. Sign in to your first account and check that old entries appear.
2. Add and complete an activity and verify it syncs to another device.
3. Test all six tabs, add/edit/delete, AI, and account switching.
4. Test second account isolation.

No live browser/device test was performed in this environment. Keep a backup and the previous working GitHub commit for rollback.
