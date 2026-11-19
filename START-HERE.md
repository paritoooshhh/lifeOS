# LifeOS Multi-User — consolidated deployment package

This is a corrected **development/testing build**, not a guarantee of production readiness. Clerk script URLs follow the official Clerk JavaScript CDN guidance. Live authentication, Google/Apple redirects, Cloudflare D1, and Groq still require deployment testing.

## One required configuration before uploading

Open `config.js` and replace `https://REPLACE-WITH-YOUR-WORKER.workers.dev` with your real Cloudflare Worker HTTPS URL, found in Cloudflare → Workers & Pages → lifeos-ai → Overview. Keep your existing Clerk publishable key. Do not put your Clerk secret key or Groq key in any frontend file.

## Cloudflare (already done, no need to repeat)

D1 `lifeos-db` has `user_states` and `ai_usage` tables. Worker binding name must be `DB`. Worker environment variable `CLERK_PUBLISHABLE_KEY` must match `config.js`. Keep the encrypted `GROQ_API_KEY`. The package includes `backend/worker.js` and `backend/schema.sql` for reference/redeployment.

## Upload to GitHub Pages

Upload the **root website files** (`index.html`, `auth.js`, `config.js`, `app.js`, `ai.js`, `style.css`, `sw.js`, icons, manifest) to the root of the `lifeOS` GitHub repository. Do NOT upload `backend/` to the public website. Wait for GitHub Pages deployment. Reload; if older files remain, unregister the LifeOS service worker without clearing storage and reload.

## Testing checklist

1. Load LifeOS in a fresh browser and verify the Clerk sign-in form appears.
2. Sign in; verify `GET /sync` succeeds with Clerk session authentication.
3. Add one activity, wait for upload, refresh, verify it persists.
4. Sign in with a second account in a private browser; verify the first account's records do not appear.
5. Check Google and Apple sign-in separately; Apple may require additional Clerk production setup.
6. Test editing from two devices; concurrent edits currently return a conflict, not an automatic merge.

## Limitations

Clerk `pk_test_` is for development and may not support your deployed GitHub Pages origin as a production domain. If Clerk rejects the domain, configure a production instance or use a supported local test origin. Offline synchronization remains experimental; export JSON backups before relying on it. The first version does not include shared spaces or automatic conflict merging.

Reference: https://clerk.com/docs/js-frontend/getting-started/quickstart
