import type { WabaQualityRow } from "../api/types";

export type StatusTone = "good" | "warning" | "serious" | "critical" | "muted";

export function sortByTimestampDesc(rows: WabaQualityRow[]): WabaQualityRow[] {
  return [...rows].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function latestWabaCheck(rows: WabaQualityRow[]): WabaQualityRow | null {
  const sorted = sortByTimestampDesc(rows);
  return sorted[0] ?? null;
}

export function qualityTone(rating: string): StatusTone {
  switch (rating?.toUpperCase()) {
    case "GREEN":
      return "good";
    case "YELLOW":
      return "warning";
    case "RED":
      return "critical";
    default:
      return "muted";
  }
}

export function connectionTone(status: string): StatusTone {
  switch (status?.toUpperCase()) {
    case "CONNECTED":
      return "good";
    case "FLAGGED":
      return "warning";
    case "DISCONNECTED":
    case "BANNED":
      return "critical";
    default:
      return "muted";
  }
}
