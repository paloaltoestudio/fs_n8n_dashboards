# Audit Dashboard

React + Vite dashboard for auditing n8n flows. Data comes from Google Sheets via an n8n webhook (see `n8n/audit-dashboard-workflow.json`), proxied through a Netlify Function so the n8n API key never reaches the browser.

## Local development

```bash
npm install
cp .env.example .env   # fill in N8N_URL / N8N_API_KEY
npm run dev:netlify    # runs Vite + the Netlify Function together
```

`npm run dev` (plain Vite, no functions) will not be able to fetch data, since the app calls `/api/audit-data`, which only exists when the function is running alongside it.

## Views

- `/` — Overview: WABA connection health, interruption alerts, MIC quick stats
- `/mic` — Full MIC audit: volume chart, failure breakdown, searchable retry-aware request table
- `/?minimal` — Stripped-down view: stat tiles + flat table, no charts

## Deploying to Netlify

1. Set `N8N_URL`, `N8N_API_KEY`, `N8N_API_KEY_HEADER` as environment variables in the Netlify UI (Site settings → Environment variables) — **not** prefixed with `VITE_`, since those are only readable by the serverless function in `netlify/functions/audit-data.mts`, never bundled into client JS.
2. Netlify picks up `netlify.toml` automatically (build command, publish dir, and the `/api/audit-data` → function redirect).

## Updating the n8n workflow

`n8n/audit-dashboard-workflow.json` is the source of truth for the webhook — re-import it into n8n after editing.
