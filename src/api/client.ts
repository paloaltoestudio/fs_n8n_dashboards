import type { AuditData, MicRow } from "./types";
import type { Env } from "../components/EnvSelector";

// Calls our own Netlify Function, never n8n directly — the n8n API key
// stays server-side and never reaches the browser bundle.
// Calling the function path directly (not the /api/audit-data redirect alias) —
// Netlify's production redirect engine doesn't reliably forward query strings
// the way `netlify dev`'s local proxy does, which silently broke ?list=/?tab=/?env=.
const PROXY_PATH = "/.netlify/functions/audit-data";

export class AuditApiError extends Error {}

async function fetchProxyJson(params: Record<string, string | undefined>): Promise<unknown> {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) qs.set(key, value);
  }
  const query = qs.toString();
  const res = await fetch(`${PROXY_PATH}${query ? `?${query}` : ""}`);

  const text = await res.text();

  if (!res.ok) {
    throw new AuditApiError(`Audit data proxy responded ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
  }

  if (!text) {
    throw new AuditApiError("Audit data proxy returned an empty response (n8n may have returned nothing).");
  }

  const body = JSON.parse(text);
  return Array.isArray(body) ? body[0] : body;
}

export async function fetchAuditData(env: Env): Promise<AuditData> {
  const data = await fetchProxyJson({ env });

  if (!data || typeof data !== "object" || !("MIC" in data)) {
    throw new AuditApiError("Unexpected response shape from the audit data proxy.");
  }

  return data as AuditData;
}

/** Lists every tab currently in the spreadsheet, so the picker never needs a hardcoded registry. */
export async function fetchTabNames(env: Env): Promise<string[]> {
  const data = await fetchProxyJson({ list: "1", env });
  const tabs = data && typeof data === "object" ? (data as Record<string, unknown>).tabs : undefined;

  if (!Array.isArray(tabs)) {
    throw new AuditApiError('Expected a "tabs" array in the response.');
  }

  return tabs as string[];
}

/** Fetches one tab's raw rows by name. */
export async function fetchTabRows(tab: string, env: Env): Promise<MicRow[]> {
  const data = await fetchProxyJson({ tab, env });
  const rows = data && typeof data === "object" ? (data as Record<string, unknown>).rows : undefined;

  if (!Array.isArray(rows)) {
    throw new AuditApiError(`Expected a "rows" array in the response for tab="${tab}".`);
  }

  return rows as MicRow[];
}
