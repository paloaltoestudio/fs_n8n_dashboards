import type { AuditData, MicRow } from "./types";

// Calls our own Netlify Function, never n8n directly — the n8n API key
// stays server-side and never reaches the browser bundle.
const PROXY_PATH = "/api/audit-data";

export class AuditApiError extends Error {}

async function fetchProxyJson(clienteSlug?: string): Promise<unknown> {
  const qs = clienteSlug ? `?cliente=${encodeURIComponent(clienteSlug)}` : "";
  const res = await fetch(`${PROXY_PATH}${qs}`);

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

export async function fetchAuditData(): Promise<AuditData> {
  const data = await fetchProxyJson();

  if (!data || typeof data !== "object" || !("MIC" in data)) {
    throw new AuditApiError("Unexpected response shape from the audit data proxy.");
  }

  return data as AuditData;
}

/** Fetches a single client's rows (e.g. cryogas) by its webhook's response key. */
export async function fetchClientRows(clienteSlug: string, dataKey: string): Promise<MicRow[]> {
  const data = await fetchProxyJson(clienteSlug);
  const rows = data && typeof data === "object" ? (data as Record<string, unknown>)[dataKey] : undefined;

  if (!Array.isArray(rows)) {
    throw new AuditApiError(`Expected a "${dataKey}" array in the response for cliente="${clienteSlug}".`);
  }

  return rows as MicRow[];
}
