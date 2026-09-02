export interface ClientConfig {
  /** Value of the ?cliente= URL param. */
  slug: string;
  /** Display name shown in the dashboard header. */
  label: string;
  /** Key holding this client's rows in its webhook's JSON response. */
  dataKey: string;
}

// Add an entry here (and a matching CLIENT_URL_ENV mapping in
// netlify/functions/audit-data.mts, plus the env var it points to) for
// each additional client's flow.
export const CLIENTS: ClientConfig[] = [{ slug: "cryogas", label: "Cryogas", dataKey: "CRYOGAS" }];

export function getClient(slug: string | null): ClientConfig | null {
  if (!slug) return null;
  return CLIENTS.find((c) => c.slug === slug) ?? null;
}
