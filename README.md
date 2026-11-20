# LifeOS Midnight — v2.0 Foundation

**Important:** This release has a companion Cloudflare Worker upgrade. Read [LIFEOS-V2-DEPLOY-GUIDE.md](LIFEOS-V2-DEPLOY-GUIDE.md) before deploying.

# LifeOS — local-first personal dashboard

## Run locally

In the `lifeos` directory:

```bash
python3 -m http.server 8080
```

Open http://localhost:8080 in your computer browser. Entries persist in that browser's localStorage.

## Publish for iPhone

Upload the *contents* of this folder to an HTTPS static host (e.g. GitHub Pages, Netlify or Cloudflare Pages). Keep `index.html`, `app.js`, `style.css`, `manifest.webmanifest`, `sw.js` and both icons together at the same URL path. Open the HTTPS URL in Safari, tap Share, Add to Home Screen, enable Open as Web App if available, and Add. Open once online so the service worker caches app files.

## Privacy and backups

No server or account is used. Records are stored in localStorage on each browser/device. Export JSON from Settings regularly; Import replaces all current records. Data does not synchronize across devices. iOS may remove site data in some circumstances; backups are essential. Do not use private browsing for long-term storage.

## Important conventions

- Internship begins 2026-11-20 but hours are unconfirmed; no work hours are prepopulated.
- All activity, finance, workout, and relationship records start empty.
- Projects are prelisted with `Not started` and progress unset, not fabricated completion.
- A completed planned activity counts toward the completion percentage; actual minutes must be entered separately.
- The actual-time chart combines completed planned activities and standalone quick logs. Avoid logging the same time in both or it will be double-counted.
- Overnight intervals should use manually entered actual minutes, with flexible start/end times.
- Fitness logging records individual exercise entries; add another entry for each exercise if needed.

## Tech

Vanilla HTML/CSS/JavaScript, localStorage, Web App Manifest, cache-first service worker. No external dependencies or analytics. No backend or cross-device sync.
