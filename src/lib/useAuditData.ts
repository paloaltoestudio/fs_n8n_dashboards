import { useCallback } from "react";
import { fetchAuditData, fetchTabNames, fetchTabRows } from "../api/client";
import type { AuditData, MicRow } from "../api/types";
import type { Env } from "../components/EnvSelector";
import { usePolling, type PolledState } from "./usePolling";

export type DashboardResult =
  | { kind: "default"; data: AuditData }
  | { kind: "tab"; tab: string; rows: MicRow[] };

/**
 * Single polling hook for the whole app: with no tab selected, fetches the
 * default combined MIC + waba_quality_checks dashboard; with one selected,
 * fetches just that tab's rows. Avoids running two competing pollers.
 */
export function useDashboardData(selectedTab: string | null, env: Env): PolledState<DashboardResult> {
  const fetcher = useCallback(async (): Promise<DashboardResult> => {
    if (selectedTab) {
      const rows = await fetchTabRows(selectedTab, env);
      return { kind: "tab", tab: selectedTab, rows };
    }
    const data = await fetchAuditData(env);
    return { kind: "default", data };
  }, [selectedTab, env]);

  return usePolling(fetcher);
}

/** The live list of spreadsheet tabs, for the picker — no hardcoded registry. */
export function useTabList(env: Env): PolledState<string[]> {
  const fetcher = useCallback(() => fetchTabNames(env), [env]);
  return usePolling(fetcher);
}
