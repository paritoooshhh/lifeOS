# LifeOS v3 — Midnight Motion

**Version:** 3.0 · **Theme:** Midnight Amber · **Logo:** Balanced Stacked L

Your existing LifeOS 2.1 planning, activity timing, skipped-activity replacement logs, AI Copilot, 13 life domains, and Clerk/Cloudflare cloud sync are preserved. This release updates the frontend visual and motion system only.

## Deploy to GitHub Pages

1. **Back up your current records** using LifeOS **Settings → Export backup** before publishing.
2. Unzip `LifeOS-v3-GitHub-Ready.zip` and copy **the contents** (not the containing folder) to the root of your existing [`lifeOS`](https://github.com/paritoooshhh/lifeOS) GitHub repository.
3. Keep the existing GitHub Pages configuration (typically **main / root**). Commit the changes and wait for GitHub Pages to publish.
4. Open **https://paritoooshhh.github.io/lifeOS/** on your computer and iPhone. Reload to receive the new app files. If a stale icon remains on the iPhone Home Screen, remove and re-add the Home Screen shortcut *after confirming your records are synced*. Do **not** clear Safari website data as a cache workaround.

No changes to the Cloudflare Worker or D1 database are required. The existing public Clerk publishable key and Worker URL remain in `config.js`; never put a secret key in the frontend.

## What's new

- **Balanced Stacked L** logo, 192/512 PWA icons, favicons, Apple touch icon and scalable SVG brand assets.
- **Midnight Amber** design tokens, premium progress rings, responsive desktop sidebar and floating mobile navigation.
- **Animated native dialogs:** iPhone bottom sheets, desktop centered popups, backdrop blur, animated exits, accessible keyboard dismissal.
- **Completion timing UX:** beautiful date/time fields, 5/10/15/20/25/30/45/50-minute earlier/later presets, ±1 and ±5-minute tuning, recorded duration preview.
- **Skipped activities:** the original event stays skipped while the user can log what they actually did instead.
- **Interactions:** page transitions, smooth progress ring changes, activity confirmation toasts, consistent hover/press states.
- **Mixed icon system:** lightweight SVG line navigation plus original dimensional PNG illustrations for relevant areas and empty states.
- **Accessibility:** reduced-motion support, high-visibility focus rings, semantic navigation, flexible layouts, safe-area insets.
- **Light-mode compatibility** remains available; the default and recommended visual identity is Midnight Amber.

## Files and responsibilities

- `index.html` — app shell, accessible navigation and modal markup
- `style.css` — original v2.1 styles, retained for compatibility
- `style-v3.css` — all new v3 visual refinements and animations
- `motion-v3.js` — UI-only animations, ring transitions and notifications
- `app.js` — original LifeOS logic with minimal decorative hooks and save notifications
- `ai.js`, `lifeos-domains.js`, `lifeos-time.js` — existing intelligence and time calculations
- `auth.js`, `config.js` — existing sign-in, cloud integration and public configuration
- `sw.js`, `manifest.webmanifest` — versioned PWA cache and icon configuration
- `illustrations/*.png` — original soft-dimensional category art

## Recommended post-deploy checks

1. Log in on iPhone and desktop; confirm **existing records** are present.
2. Visit Today, Plan, Log, Track → Insights, AI Copilot and Review.
3. Mark an activity completed, adjust its time and verify the exact recorded duration in Time & Attention and Insights.
4. Skip an activity, log a replacement, and verify the original stays skipped while the replacement counts as actual time.
5. Plan an activity crossing midnight and verify the intended date split.
6. Check cloud sync on both devices, then check appearance and popups on mobile and desktop.

## Verification note

Local Node regression tests and mocked browser interaction tests passed for the v3 frontend. Those checks do **not** constitute a live check of your Clerk login, Cloudflare service, GitHub Pages deployment or data on your devices. Please complete the post-deploy checks above.

The Cloudflare Worker is **not** included in the GitHub upload ZIP because it remains deployed separately and was not changed for v3.
