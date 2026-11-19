# LifeOS AI upgrade

## Important: preserve your existing records

1. Open your currently installed LifeOS and **export a JSON backup** before updating.
2. Upload the **contents of this folder EXCEPT `backend/`** to the ROOT of your existing `lifeOS` GitHub repository. Do not create a new repository. Replace existing `index.html`, `app.js`, `style.css`, and `sw.js`. Add `ai.js`. Existing localStorage key remains `lifeos.data.v1`.
3. Cloudflare Workers: create a Worker named `lifeos-ai` using the code in `backend/worker.js` (paste into the online code editor), or deploy with Wrangler from the `backend` directory.
4. In Worker Settings → Variables and Secrets, add **Secret** `OPENAI_API_KEY` (your OpenAI API key) and **Secret** `LIFEOS_ACCESS_TOKEN` (a long random private token of at least 24 characters). Never put either value in GitHub, browser JavaScript, or a URL.
5. Deploy the Worker, copy its `https://...workers.dev` URL, open LifeOS → AI → Configure AI endpoint, enter the URL. Enter your separate LIFEOS_ACCESS_TOKEN when prompted. It stays in sessionStorage until that app session ends.
6. Test with `I want to study Verilog for 2 hours tomorrow and call my girlfriend.` Review suggestions and save.

## Security / limits

This is a single-user token-protected starter backend. A shared secret in the client session can be stolen if the device is compromised or browser JavaScript is compromised. CORS is not authentication; the bearer token is. For robust public exposure add Cloudflare rate limiting, usage limits/budget alerts, and optionally Cloudflare Access. The Worker never returns the OpenAI API key. API usage is billed separately from ChatGPT subscriptions. Descriptions are sent to OpenAI, not the full local database. No cross-device sync. GitHub Pages remains unchanged as host. Offline AI requests do not work; existing LifeOS functionality does.

The preview requires explicit approval before writes; there is no autonomous background logging. Review AI suggestions for correctness. The Worker uses Structured Outputs but also needs application-level validation for production hardening.
