# LifeOS 3.0 — Midnight Motion

**Date:** 20 November 2026

## Design specification

- Brand: Balanced geometric Stacked L, amber gradient on near-black background
- Palette: background `#080E14`, surface `#111827`, elevated `#1F293B`, primary `#F6A623`, highlight `#FFD58A`, success `#44D080`, info `#60A5FA`
- Typography: system SF Pro Display where available, Inter/system fallback
- Navigation: minimal stroked SVG icons; dimensional PNG art for selected contexts
- Motion: dialog open ~320–340 ms, dialog exit ~180–190 ms, tab transition ~260 ms, ring interpolation ~800 ms; reduced motion respected
- Mobile: safe-area-aware floating navigation and full-width bottom sheets
- Desktop: fixed 246px sidebar with a spacious 12-column dashboard

## Compatibility

- Builds on LifeOS 2.1 Adaptive Insights source
- Preserves `version: 1` record schema and existing localStorage keys
- Preserves Cloudflare Worker/D1 API, Clerk configuration, time tracking, AI and 13 domains
- No DB migration required; v3 is a presentation-only functional upgrade

## Local regression coverage

- Native JS unit suites: overnight activity allocation, explicit/manual timer provenance, completion review and offsets, skipped replacement logs, domain insights
- Worker API integration suite: prompt validation, JWT/auth behavior, scoped planning requests and overnight proposals (unchanged Worker source)
- Headless Chromium UI: desktop 1440×900, iPhone-like 402×874, smaller phone 360×740, tablet 810×1080; no JavaScript errors or horizontal viewport overflow
- Interactive flows: navigation, popup open/close, ±1-minute adjustment, 15/30-minute presets, completion saving, skipped-activity replacement, Insights totals, theme toggling, entry dialog

**Not tested:** a live production login or live cross-device Cloudflare sync. Those require deployment and account-specific verification.
