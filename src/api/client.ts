import type { AuditData } from "./types";

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;
const API_KEY_HEADER = import.meta.env.VITE_API_KEY_HEADER || "X-Api-Key";

export class AuditApiError extends Error {}

export async function fetchAuditData(): Promise<AuditData> {
  if (!API_URL) {
    throw new AuditApiError(
      "VITE_API_URL is not set. Copy .env.example to .env.local and fill it in."
    );
  }

  const res = await fetch(API_URL, {
    headers: API_KEY ? { [API_KEY_HEADER]: API_KEY } : undefined,
  });

  if (!res.ok) {
    throw new AuditApiError(`n8n endpoint responded ${res.status} ${res.statusText}`);
  }

  const body = await res.json();
  const data = Array.isArray(body) ? body[0] : body;

  if (!data || typeof data !== "object" || !("MIC" in data)) {
    throw new AuditApiError("Unexpected response shape from n8n endpoint.");
  }

  return data as AuditData;
}
