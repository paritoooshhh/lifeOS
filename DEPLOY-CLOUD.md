# LifeOS Cloud Sync setup

1. In Cloudflare D1 > lifeos-db > Console, run the SQL from `backend/schema.sql`.
2. In Workers & Pages > lifeos-ai > Settings > Bindings, add a **D1 database** binding with variable name **DB** pointing to **lifeos-db**. Deploy.
3. Replace the Worker code with `backend/worker.js` and Deploy. Keep `GROQ_API_KEY` and `LIFEOS_ACCESS_TOKEN` secrets unchanged.
4. Upload the updated frontend root files (`index.html`, `app.js`, `ai.js`, `style.css`, `sw.js`, manifest, icons) to the root of your existing GitHub repository `lifeOS`. Do not upload backend secrets.
5. Open LifeOS > AI and generate one test suggestion to initialize the access token in this browser session, but do not save the suggestion unless desired.
6. Open Settings (gear icon) > LifeOS Cloud Sync > **Connect / initialize cloud**. Since D1 is empty, confirm upload of this device's current data.
7. On the second device, open LifeOS > AI, configure the same endpoint, enter the same access token, then Settings > Connect / initialize cloud > Download.
8. Changes save locally and try uploading automatically when online. To fetch another device's latest changes, use Download cloud copy. This version does NOT implement automatic background downloads, merge, or per-record conflict resolution. A 409 conflict blocks overwrites.

IMPORTANT: This is a single-user starter implementation with a shared bearer token, not a complete login system. Never publish the token. Use a strong random token, keep backups, and consider Cloudflare rate limiting. Concurrent editing requires manual conflict resolution. The access token is session-only; enter it again in the AI tab after browser restart. Sync revision persists locally. On a newly installed device, connect and download before entering new data. Keep both devices from editing simultaneously until a stronger sync engine is added.
