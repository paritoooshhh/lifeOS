# LifeOS 2.0 — Foundation Release (20 November 2026)

This is an **incremental, backwards-compatible foundation build**, not a fully implemented LifeOS 2.0. It upgrades planning accuracy, completion/timing evidence and Copilot proposals. Your existing Midnight appearance, Clerk setup, Cloudflare D1 account data, Groq endpoint and account-scoped cloud snapshots remain in place.

## IMPORTANT: back up first

1. Open the currently working LifeOS, navigate to Settings, and **Export backup**. Store the JSON safely. Repeat for the other account if you use two accounts.
2. Confirm all local changes are synced on both devices. The existing sync strategy rejects concurrent revisions with `409`; it does **not** merge simultaneous edits.
3. Save the current Cloudflare Worker code to a local file, and preserve the previous working GitHub commit. Do not post your Worker secrets or Clerk signing keys anywhere.
4. Prefer testing this bundle on a separate GitHub Pages branch / Worker staging environment before updating production. A staged test must be configured for the correct Clerk origin; do not loosen production CORS to make it work.

## Deploy in this order

### A. Cloudflare Worker (required for new Copilot behavior)

1. Open your **existing** `lifeos-ai` Cloudflare Worker; back up its working code.
2. Replace only the Worker source with the provided `CLOUDFLARE-WORKER.js` from this release. Do not create a new Worker or change the frontend Worker URL.
3. Keep existing bindings/secrets unchanged:
   - `DB` — the **same existing** Cloudflare D1 database (`user_states`, `ai_usage` tables).
   - `GROQ_API_KEY` — existing private Worker secret.
   - `CLERK_PUBLISHABLE_KEY` — existing Worker variable or secret; value must match your Clerk instance.
4. Optional Worker variable: `LIFEOS_AI_MODEL=openai/gpt-oss-120b`. **Leave it unset** to retain the previously working `openai/gpt-oss-20b`. Check model availability and free quotas in your Groq Console before changing this.
5. Deploy the Worker and verify the existing `/sync` endpoint still serves authenticated data. The new AI response remains compatible with the previous frontend's `entries` field.

**No D1 migrations or new bindings are needed.** The cloud state continues using `user_states.payload` with `version: 1`, preserving previously stored records. The AI quota table is unchanged and remains limited to 30 requests per account per UTC day.

### B. GitHub Pages frontend

1. Download **LifeOS-v2.0-Foundation-Frontend.zip** and extract it.
2. Upload **the files inside that ZIP** to the root of your existing `paritoooshhh/lifeOS` repository, replacing the matching files. Do not delete account data or change your GitHub Pages project path `/lifeOS/`.
3. In particular, make sure the **new** `lifeos-time.js` file is uploaded alongside `app.js`, `ai.js`, `index.html`, and `sw.js`.
4. After Pages deploys, refresh the PC with Ctrl+Shift+R. If the old desktop UI remains, check Application → Service Workers and update/unregister the old service worker **without clearing Local Storage or IndexedDB**. On iPhone, close and reopen the installed PWA.
5. Verify both accounts can sign in and that PC-to-iPhone cloud updates still work before adding important new data.

## Acceptance tests (use disposable test entries)

| Test | Expected behavior |
|---|---|
| “Plan my day. I woke up at 8:30” | Multiple realistic **reviewable** entries, not an activity called “Plan my day” with no end time. Optional generic suggestions are explicitly labeled. |
| Overnight gaming, Nov 19 21:00 → Nov 20 02:00 | One activity visible on both days; planned time = **3h** on Nov 19 and **2h** on Nov 20. |
| Mark a scheduled activity **Complete** | Completion count/ring changes. Time recorded stays **unknown** unless manually entered or timed. |
| Tap **Start**, then **Pause** and **Resume**, then **Complete** | Date-stamped active intervals are persisted; pauses do not count as active time. |
| Complete 08:00–09:00 at 08:45 | Shows **15m ahead of scheduled end** if completed in that interval; no invented observed 45m. |
| Return after midnight | When the selected date is the former “Today,” the Home view advances to the new local date on wake/focus or periodic clock check. |
| Ask “Move my study session to 15:00” | AI may propose a targeted change, displayed in the review panel, not applied until approval; conflicting proposals are blocked. |
| Cancel a Copilot proposal | No data changes. |
| Save on PC, open iPhone | Data appears once the existing cloud sync completes / cloud copy is downloaded. |
| Second account | First account’s data remains absent. |

## What changed

- New shared deterministic time utility `lifeos-time.js` for planned/observed date slicing and timing variance.
- Home **Today’s intelligence** cards: completion count, scheduled time, observed/entered time, and activities ending ahead of their planned boundary.
- One-tap completion does **not** manufacture duration; optional Start/Pause/Finish records UTC active intervals with confidence/source metadata.
- Planner includes blocks carried over from the previous day, while one activity remains one underlying record.
- Copilot sends the selected date, local clock/timezone, and the user's existing activity IDs to the Worker. Worker returns intent, explanation, assumptions, new entries, and existing-record updates for review. New activities always default to `planned`.
- AI outputs are sanitized; incomplete time intervals become flexible rather than ending “never”; invalid date ranges are rejected; conflicts are blocked before applying.
- Shared Spaces entry points are hidden, but previously stored shared spaces are **not deleted**.
- New PWA cache version ensures the updated assets can replace stale versions.

## Important limitations (still future phases)

- This is not the full researched 13-domain insight engine, reference-class duration forecasting, optimizer, long-term conversational memory, or multi-provider AI router.
- The Worker is still Groq-based, with `json_object` output plus deterministic validation, not a strict guaranteed JSON schema.
- No dedicated D1 `activities` / `timer_intervals` tables. The current per-user JSON snapshot remains authoritative. Timestamped intervals are embedded in activity records.
- Frontend timing reflects the device-local timezone. The Worker uses an IANA timezone supplied by the browser for AI context, but full travel/DST-aware timezone migration is not implemented.
- Legacy records without trustworthy actual timestamps remain attributed to their original date if their exact across-midnight distribution is unknown. Their duration is **not fabricated or forcibly moved**.
- The sync revision mechanism remains `409` conflict detection; it does not yet support field-level merge or a robust multi-device mutation outbox.
- AI can propose creating entries and limited status/move changes. It is not an always-running agent and does not automatically edit records without confirmation.
- This code has automated JavaScript and mocked Worker API checks, but is **not yet live-tested** with your actual Clerk instance, Cloudflare Worker, D1 database, or devices. Deploy carefully and retain rollback versions.

## Rollback

If authentication, sync, or AI breaks, restore the saved Worker code and previous GitHub commit. Preserve/export the latest locally changed JSON before downloading an older cloud snapshot, because the existing system has no automatic field-level conflict resolution. The new optional fields are ignored by the old frontend and stored as part of the JSON payload, but old UI may not expose them.

## Security

Never upload private API keys, JWT signing keys, Clerk secret keys, or D1 credentials to GitHub Pages. The frontend uses only the public Clerk publishable key and configured Worker URL. All authenticated writes remain scoped to the verified Clerk `sub` in the Worker.
