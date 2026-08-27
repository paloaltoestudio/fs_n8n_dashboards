import type { MicRow } from "../api/types";

export interface MicProcess {
  processId: string;
  attempts: MicRow[];
  latest: MicRow;
  attemptCount: number;
}

/** Groups raw MIC rows by process_id and sorts each group's attempts chronologically. */
export function groupByProcess(rows: MicRow[]): MicProcess[] {
  const byId = new Map<string, MicRow[]>();
  for (const row of rows) {
    const list = byId.get(row.process_id);
    if (list) list.push(row);
    else byId.set(row.process_id, [row]);
  }

  return Array.from(byId.entries()).map(([processId, attempts]) => {
    const sorted = [...attempts].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    return {
      processId,
      attempts: sorted,
      latest: sorted[sorted.length - 1],
      attemptCount: sorted.length,
    };
  });
}

export interface MicSummary {
  uniqueRequests: number;
  totalAttempts: number;
  successCount: number;
  failingCount: number;
  successRate: number;
  avgAttemptsPerRequest: number;
  retriedCount: number;
  currentlyFailing: MicProcess[];
}

export function summarize(processes: MicProcess[], totalAttempts: number): MicSummary {
  const uniqueRequests = processes.length;
  const successCount = processes.filter((p) => p.latest.success).length;
  const failingCount = uniqueRequests - successCount;
  const retriedCount = processes.filter((p) => p.attemptCount > 1).length;

  const currentlyFailing = processes
    .filter((p) => !p.latest.success)
    .sort(
      (a, b) => new Date(b.latest.timestamp).getTime() - new Date(a.latest.timestamp).getTime()
    );

  return {
    uniqueRequests,
    totalAttempts,
    successCount,
    failingCount,
    successRate: uniqueRequests === 0 ? 0 : successCount / uniqueRequests,
    avgAttemptsPerRequest: uniqueRequests === 0 ? 0 : totalAttempts / uniqueRequests,
    retriedCount,
    currentlyFailing,
  };
}

export interface ErrorBreakdownEntry {
  reason: string;
  count: number;
}

/** Ranks the distinct failure reasons among currently-failing requests. */
export function errorBreakdown(currentlyFailing: MicProcess[]): ErrorBreakdownEntry[] {
  const counts = new Map<string, number>();
  for (const p of currentlyFailing) {
    const reason = p.latest.error?.trim() || "Sin mensaje de error";
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

export interface DailyBucket {
  date: string; // YYYY-MM-DD
  success: number;
  failed: number;
}

/** Buckets every raw attempt (not deduped) by calendar day for a volume-over-time chart. */
export function attemptsByDay(rows: MicRow[]): DailyBucket[] {
  const buckets = new Map<string, DailyBucket>();
  for (const row of rows) {
    const day = row.timestamp.slice(0, 10);
    let bucket = buckets.get(day);
    if (!bucket) {
      bucket = { date: day, success: 0, failed: 0 };
      buckets.set(day, bucket);
    }
    if (row.success) bucket.success += 1;
    else bucket.failed += 1;
  }
  return Array.from(buckets.values()).sort((a, b) => a.date.localeCompare(b.date));
}
