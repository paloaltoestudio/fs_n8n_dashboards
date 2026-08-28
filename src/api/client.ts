import type { AuditData } from "./types";

// Calls our own Netlify Function, never n8n directly — the n8n API key
// stays server-side and never reaches the browser bundle.
const PROXY_PATH = "/api/audit-data";

export class AuditApiError extends Error {}

export async function fetchAuditData(): Promise<AuditData> {
  const res = await fetch(PROXY_PATH);

  const text = await res.text();

  if (!res.ok) {
    throw new AuditApiError(`Audit data proxy responded ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
  }

  if (!text) {
    throw new AuditApiError("Audit data proxy returned an empty response (n8n may have returned nothing).");
  }

  const body = JSON.parse(text);
  const data = Array.isArray(body) ? body[0] : body;

  if (!data || typeof data !== "object" || !("MIC" in data)) {
    throw new AuditApiError("Unexpected response shape from the audit data proxy.");
  }

  return data as AuditData;
}
