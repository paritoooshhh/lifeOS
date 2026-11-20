# LifeOS v3 — Living Glass UI/Motion Update

**Still v3: no backend or schema migration.**

Added Balanced Glass CSS layer, four ambient motion themes, optional GSAP/ScrollTrigger, offline animation fallback, reduced-motion/visibility handling and an on-device motion toggle. Original Living Nature art and all app.js/auth.js/ai.js code are unchanged.

# LifeOS v3 — Living Nature UI Update

**November 20, 2026 · Version 3.0 retained.**

This is a **major UI refresh within v3**, not LifeOS v4. The existing data model, scheduling behaviors, AI Copilot and Clerk/Cloudflare infrastructure are preserved.

### Approved four-theme design

- **Kerala Green / Morning (05:00–11:59):** lush, full-height coconut palms and soft green surfaces; one delicate leaf motif in prominent cards.
- **Ocean Blue / Afternoon (12:00–16:59):** layered blue wave contours and fine wave-line card details.
- **Golden Hour / Evening (17:00–20:59):** golden sun and horizon contours, subtle sun-arc cards.
- **Deep Indigo / Night (21:00–04:59):** moon, orbits and sparse stars; understated stars inside cards.

Each mode uses shades of one color family. The landscapes extend across the entire mobile/desktop viewport; cards retain high-contrast text and minimal decoration. The design is applied to all LifeOS views using shared CSS tokens, without removing app capabilities.

### New UI interactions

- Automatic mode from device-local time; optional persistent manual override
- Theme chooser from appearance icon or Settings
- Responsive illustrated full-screen backdrops, gentle scroll parallax and subtle scrolling ornament accents
- Refined desktop sidebar, typography, progress ring, action buttons, floating mobile navigation and native dialogs
- Reduced-motion support

### Safe integration

No changes to auth, AI, time engine, cloud database, Worker endpoints or user storage formats. Old theme preference is left in existing data for backward compatibility, but the Living Nature mode is stored separately on this device. Existing Clerk/D1 data remains intact. Always export a backup before updating GitHub Pages.

### Local verification

Browser-mock checks passed on 1440px desktop and 390px mobile for home, planner, track, Copilot, settings, theme switching, manual preference and modal controls. Live service integration requires verification on deployed accounts/devices.
