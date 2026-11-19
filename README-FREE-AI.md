# LifeOS AI — Groq free-tier deployment

This replaces OpenAI API calls with GroqCloud. Your existing `lifeos.data.v1` records are unchanged.

1. Export a LifeOS JSON backup before updating anything.
2. Create a free API key at https://console.groq.com/keys . Never publish the key.
3. In Cloudflare Workers > lifeos-ai > Settings > Variables and Secrets, add a Production **Secret** named `GROQ_API_KEY` with that key. Keep `LIFEOS_ACCESS_TOKEN` unchanged. You may remove `OPENAI_API_KEY` after verifying the replacement.
4. Open Worker **Edit code** and replace the entire code with `backend/worker.js`. Deploy.
5. Your GitHub Pages frontend is compatible with the new Worker; uploading frontend files is optional. If you want the updated free-tier label, upload `ai.js` to the same repository root, replacing the old file. Do not upload the backend directory to GitHub Pages.
6. Open the existing LifeOS AI tab and Generate suggestions. The configured Worker URL and access token stay the same.

The free tier is rate limited and may change. Requests send the text you submit plus selected date and a small list of existing planned activities to Groq. The app still requires explicit approval to save suggestions. Cloudflare secret values must never be shared. Avoid uploading exported personal data to a public GitHub repository.
