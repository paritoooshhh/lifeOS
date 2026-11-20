# LifeOS v3 — Living Nature (Major UI Refresh)

**Version: 3.0 · Visual system: Living Nature · App/data version unchanged**

LifeOS is still **v3**. This release replaces the old Midnight Amber presentation with four approved, single-hue, nature-inspired themes while keeping the existing LifeOS functionality and cloud architecture.

## Install on your GitHub Pages site

1. **Back up your records** in LifeOS (**Settings → Export backup**) before deploying.
2. Extract this ZIP. Upload **its contents** directly to the root of your existing [lifeOS repository](https://github.com/paritoooshhh/lifeOS). Do **not** upload the enclosing folder.
3. Commit to the branch used for GitHub Pages (usually `main`). Existing Clerk and Cloudflare Worker settings remain in `config.js`.
4. Visit <https://paritoooshhh.github.io/lifeOS/> on desktop and iPhone, reload, then verify your synced records and account.
5. If you use the iPhone home-screen app and see stale styling, fully close and reopen it or refresh. Do **not** clear browser website data just to refresh the theme.

## The Living Nature system

| Local device time | Theme | Palette | Scene | Minimal card accent |
| --- | --- | --- | --- | --- |
| 05:00–11:59 | **Kerala Green** | Green and its shades | Coconut palms, paddy landscape | Leaf detail |
| 12:00–16:59 | **Ocean Blue** | Blue and its shades | Flowing water contours | Fine wave lines |
| 17:00–20:59 | **Golden Hour** | Golden amber and its shades | Sunburst, horizon | Cropped sun arcs |
| 21:00–04:59 | **Deep Indigo** | Indigo and its shades | Moon, orbits, stars | Tiny scattered stars |

**Automatic mode** follows device-local time, checked every minute and when returning to the tab. Use the **◐ appearance button**, or **Settings → Living Nature themes**, to choose a manual override. The manual preference lives in a separate `localStorage` key (`lifeos.v3.nature.themePreference`) and does not enter cloud activity records.

The same visual system applies across Home, Planner, Journal, Track/Insights, Copilot, Review, Settings and timing dialogs; desktop sidebar and iPhone navigation are retained. Full-screen artwork is responsive; movement is lightweight and disabled when reduced motion is requested.

## Unchanged functionality

- Clerk authentication, Cloudflare Worker and D1 cloud sync
- Original LifeOS local storage key and JSON data schema
- Activities, calendar, timers, pause/resume, smart rescheduling
- Midnight date rollover and overnight activity splitting
- Explicit completion-time confirmation and fine-adjustment shortcuts
- Skipped activities and optional actual-time replacement logs
- AI Copilot proposal review/approval, time and domain analytics
- PWA installation, export/import backup and offline asset caching

Shared Spaces is not exposed in navigation. No previously stored records are deleted or migrated.

## What changed

- `nature-v3.css` — time-of-day theme tokens, responsive dashboards, component refinements and sidebar visual treatment
- `nature-v3.js` — automatic/manual theme selection, presentation-only scroll movement and Settings theme chooser
- `nature/*.svg` — 12 local vector artworks (desktop/mobile scenes and subtle card details)
- `index.html` — new stylesheet and script imports; title and browser theme color
- `app.js` — only three UI-related lines: theme button label, appearance button action and dark/light UI switch replaced by theme chooser. **No scheduling, sync or AI code changed.**
- `sw.js`, `manifest.webmanifest` — new cache ID, theme files precached and app description updated

The previous `style.css`, `style-v3.css` and `motion-v3.js` are retained for compatible existing markup and interactions; the new CSS loads **after** them.

## Recommended post-deploy test

1. Sign in on computer and iPhone and confirm prior records.
2. Try **◐ → Automatic / Morning / Afternoon / Evening / Night**; verify all screen backgrounds and card accents.
3. On iPhone, ensure Today, Plan, Log, Track, Copilot and Review remain accessible in the floating bottom bar.
4. On desktop, ensure sidebar links, theme panel, dialogs and scrollable timelines work.
5. Complete a scheduled event with actual start/end time; confirm no time is invented.
6. Skip an event and optionally log what you did instead.
7. Verify an overnight event splits properly across midnight.
8. Make a change on one device and verify sync on the other; export a backup first.

## Verification scope

Inline browser-mock tests validated the four themes, responsive widths, Today/Plan/Track/Copilot, Settings theme selector, modal presence and no runtime JS errors. These tests do **not** establish a live Clerk sign-in, live Cloudflare access or actual iPhone Safari performance. The uploaded archive includes no Cloudflare Worker code because the Worker isn't changed.
