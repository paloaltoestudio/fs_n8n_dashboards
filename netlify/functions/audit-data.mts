import type { Context } from "@netlify/functions";

// Server-side only — these are plain env vars (not VITE_*), so Vite never
// bundles them into client JS and Netlify's secrets scanner has nothing to flag.
const N8N_URL = process.env.N8N_URL;
const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_API_KEY_HEADER = process.env.N8N_API_KEY_HEADER || "X-Api-Key";

export default async (_req: Request, _context: Context) => {
  if (!N8N_URL) {
    return new Response("N8N_URL is not configured on the server.", { status: 500 });
  }

  const res = await fetch(N8N_URL, {
    headers: N8N_API_KEY ? { [N8N_API_KEY_HEADER]: N8N_API_KEY } : undefined,
  });

  const body = await res.text();

  return new Response(body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
};
