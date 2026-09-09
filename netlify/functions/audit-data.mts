import type { Context } from "@netlify/functions";

// Server-side only — these are plain env vars (not VITE_*), so Vite never
// bundles them into client JS and Netlify's secrets scanner has nothing to flag.
const N8N_URL = process.env.N8N_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_API_KEY_HEADER = process.env.N8N_API_KEY_HEADER || "X-Api-Key";

// Audit data must always be fresh — never let Netlify's CDN cache this response.
const NO_STORE_HEADERS = { "Cache-Control": "no-store" };

export default async (req: Request, _context: Context) => {
  if (!N8N_URL) {
    console.error("audit-data: N8N_URL is not configured");
    return new Response("N8N_URL is not configured on the server.", {
      status: 500,
      headers: NO_STORE_HEADERS,
    });
  }

  // Forward query params as-is (?list=1, ?tab=<name>, or none for the default
  // combined MIC + waba_quality_checks response) — n8n itself decides which
  // branch to run, so this function stays a thin, client-agnostic proxy.
  const incomingQuery = new URL(req.url).search;
  const targetUrl = `${N8N_URL}${incomingQuery}`;

  let res: Response;
  try {
    res = await fetch(targetUrl, {
      headers: N8N_API_KEY ? { [N8N_API_KEY_HEADER]: N8N_API_KEY } : undefined,
    });
  } catch (err) {
    console.error("audit-data: fetch to n8n failed", err);
    return new Response(`Failed to reach n8n: ${err instanceof Error ? err.message : String(err)}`, {
      status: 502,
      headers: NO_STORE_HEADERS,
    });
  }

  const body = await res.text();

  if (!res.ok) {
    console.error(`audit-data: n8n responded ${res.status} ${res.statusText}`, body);
  } else if (!body) {
    console.error(`audit-data: n8n responded 200 with an empty body (query=${incomingQuery || "none"})`);
  }

  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": "application/json", ...NO_STORE_HEADERS },
  });
};
