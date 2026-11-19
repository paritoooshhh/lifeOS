# LifeOS Multi-User v1 — deployment

## Safety / status
This is a development build. It has been syntax-checked but NOT live-tested with your Clerk, Groq, Cloudflare Worker or iPhone. Test with two throwaway accounts before storing private data. Do not deploy the previous single-user Cloud Sync ZIP.

## 1. D1
Cloudflare → D1 → lifeos-db → Console. Run the contents of `backend/schema.sql`. This creates `user_states` and `ai_usage`; it does not use the old `lifeos_state` table.

## 2. Cloudflare Worker
Workers & Pages → lifeos-ai → Settings → Bindings → add D1 database binding `DB` → select `lifeos-db`.
Add a **plain text environment variable** `CLERK_PUBLISHABLE_KEY` with the `pk_test_...` key in `config.js`. This is a public identifier, not a secret.
Keep encrypted secret `GROQ_API_KEY` unchanged. `LIFEOS_ACCESS_TOKEN` is no longer used by this build; keep it temporarily for rollback, then remove once tested.
Replace the Worker code with `backend/worker.js`, then Deploy. Your old AI clients will stop working until the new frontend is deployed because this backend requires Clerk tokens.

## 3. GitHub Pages frontend
Edit `config.js`: set `workerUrl` to your exact deployed Worker HTTPS URL, with no trailing slash. Keep the Clerk publishable key. Upload the frontend files (index.html, style.css, app.js, ai.js, auth.js, config.js, sw.js, manifest.webmanifest, icon-192.png, icon-512.png) to the root of your `lifeOS` GitHub repository. Do not upload `backend/` to GitHub Pages (you can keep it in a separate private development repo if desired).
Wait for GitHub Pages to update. Hard-refresh or clear the old service worker cache if the old version persists.

## 4. Clerk development limitations
The included `pk_test_` key is for development. Clerk development instances may reject sign-ins from a GitHub Pages production-style domain. If that happens, DO NOT bypass security; test locally on localhost or configure a Clerk production instance and replace both frontend and Worker publishable keys. For a public launch, also configure Apple sign-in, production domains, legal/privacy pages, and abuse limits.

## 5. Test two independent accounts
A: sign in, create one activity, wait a few seconds, verify it survives a reload. B: sign in on a separate private browser and verify A's activity is absent. B: add a record, verify A cannot see it. Test Google, email/password, and Apple separately; Apple may require production setup.

## Important v1 limitations
- Cloud data is fetched on login/reload. Manual Download fetches changes from another device. Concurrent edits return HTTP 409; they are NOT merged. Export a backup before conflict resolution.
- Changes made while offline remain in user-scoped localStorage and are retried when back online, but the next full login currently reloads cloud state; do not sign out or reload while offline edits are pending. This is a development limitation to fix before relying on offline usage.
- Each AI account is capped at 30 requests/day; Groq's own free-tier quota is shared by the application.
- User data is isolated by verified Clerk user ID on the Worker, not by browser-provided IDs.
- This is not yet a production-hardened public service. Add a tested recovery flow, proper sync queue, account deletion, backups, and security testing before inviting public users.
