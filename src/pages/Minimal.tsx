import { useMemo, useState } from "react";
import type { MicRow } from "../api/types";
import { Card } from "../components/Card";
import { StatTile } from "../components/StatTile";
import { FlatLogTable } from "../components/FlatLogTable";
import { distinctExecutions, groupByProcess, normalizeExecution, summarize } from "../lib/mic";
import { formatPercent } from "../lib/format";
import { exportRowsToCsv } from "../lib/csv";
import "./Minimal.css";

interface MinimalProps {
  rows: MicRow[];
  title: string;
  subtitle: string;
}

type StatusFilter = "all" | "success" | "failing";

export function Minimal({ rows, title, subtitle }: MinimalProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [executionFilter, setExecutionFilter] = useState<string>("all");

  const executions = useMemo(() => distinctExecutions(rows), [rows]);

  // Selecting an execution scopes the *whole page* (stats included) to that
  // batch's rows, not just the visible table — same mental model as picking
  // a different client.
  const scopedRows = useMemo(() => {
    if (executionFilter === "all") return rows;
    return rows.filter((r) => normalizeExecution(r.execution) === executionFilter);
  }, [rows, executionFilter]);

  const processes = useMemo(() => groupByProcess(scopedRows), [scopedRows]);
  const summary = useMemo(() => summarize(processes, scopedRows.length), [processes, scopedRows.length]);

  // Filter/search on the latest attempt per process (not every raw row), so
  // the table always agrees with the stat tiles above — a process with an
  // old failed attempt but a later successful retry counts as succeeding,
  // in both places, same as the full MIC dashboard.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return processes
      .filter((p) => {
        const row = p.latest;
        if (statusFilter === "success" && !row.success) return false;
        if (statusFilter === "failing" && row.success) return false;
        if (!q) return true;
        return (
          row.process_id.toLowerCase().includes(q) ||
          row.error?.toLowerCase().includes(q) ||
          row.api_process_id?.toLowerCase().includes(q)
        );
      })
      .map((p) => p.latest)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [processes, query, statusFilter]);

  return (
    <div className="minimal">
      <div className="minimal__header">
        <h2 className="minimal__title">{title}</h2>
        <p className="minimal__subtitle">{subtitle}</p>
      </div>

      <div className="minimal__stats">
        <StatTile label="Procesos únicos" value={summary.uniqueRequests} />
        <StatTile
          label="Tasa de éxito"
          value={formatPercent(summary.successRate)}
          tone={summary.successRate >= 0.9 ? "good" : summary.successRate >= 0.6 ? "warning" : "critical"}
        />
        <StatTile
          label="Fallando ahora"
          value={summary.failingCount}
          tone={summary.failingCount === 0 ? "good" : "critical"}
        />
        <StatTile label="Registros totales" value={summary.totalAttempts} />
      </div>

      <Card
        title="Registros"
        action={
          <div className="minimal__filters">
            {executions.length > 0 && (
              <select
                className="minimal__select"
                value={executionFilter}
                onChange={(e) => setExecutionFilter(e.target.value)}
              >
                <option value="all">Todas las ejecuciones</option>
                {executions.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            )}
            <div className="minimal__toggle">
              {(["all", "failing", "success"] as StatusFilter[]).map((f) => (
                <button
                  key={f}
                  className={statusFilter === f ? "is-active" : ""}
                  onClick={() => setStatusFilter(f)}
                >
                  {f === "all" ? "Todos" : f === "failing" ? "Fallando" : "Exitosos"}
                </button>
              ))}
            </div>
            <input
              className="minimal__search"
              placeholder="Buscar por proceso o error…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="minimal__download"
              onClick={() => exportRowsToCsv(title.toLowerCase().replace(/\s+/g, "-"), filtered)}
              disabled={filtered.length === 0}
            >
              Descargar CSV
            </button>
          </div>
        }
      >
        <FlatLogTable rows={filtered} />
      </Card>
    </div>
  );
}
