import { useCallback } from "react";
import { fetchAuditData, fetchClientRows } from "../api/client";
import type { AuditData, MicRow } from "../api/types";
import { getClient } from "./clients";
import { usePolling, type PolledState } from "./usePolling";

export type DashboardResult =
  | { kind: "default"; data: AuditData }
  | { kind: "client"; label: string; rows: MicRow[] };

/**
 * Single polling hook for the whole app: resolves `clienteSlug` against the
 * client registry and fetches the right dataset, so callers never run two
 * competing pollers just to decide which one they actually need. An
 * unrecognized `clienteSlug` surfaces as an error rather than silently
 * falling back to the default dataset.
 */
export function useDashboardData(clienteSlug: string | null): PolledState<DashboardResult> {
  const client = getClient(clienteSlug);
  const unknownClient = clienteSlug !== null && !client;

  const fetcher = useCallback(async (): Promise<DashboardResult> => {
    if (unknownClient) {
      throw new Error(`Cliente desconocido: "${clienteSlug}".`);
    }
    if (client) {
      const rows = await fetchClientRows(client.slug, client.dataKey);
      return { kind: "client", label: client.label, rows };
    }
    const data = await fetchAuditData();
    return { kind: "default", data };
  }, [client, unknownClient, clienteSlug]);

  return usePolling(fetcher);
}
