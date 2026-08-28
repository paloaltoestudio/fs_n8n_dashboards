import { useMemo, useState } from "react";
import type { MicRow } from "../api/types";
import { Card } from "../components/Card";
import { StatTile } from "../components/StatTile";
import { FlatLogTable } from "../components/FlatLogTable";
import { groupByProcess, summarize } from "../lib/mic";
import { formatPercent } from "../lib/format";
import "./Minimal.css";

interface MinimalProps {
  rows: MicRow[];
  lastUpdated: Date | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

type StatusFilter = "all" | "success" | "failing";

export function Minimal({ rows, lastUpdated, loading, error, onRefresh }: MinimalProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const processes = useMemo(() => groupByProcess(rows), [rows]);
  const summary = useMemo(() => summarize(processes, rows.length), [processes, rows.length]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((row) => {
        if (statusFilter === "success" && !row.success) return false;
        if (statusFilter === "failing" && row.success) return false;
        if (!q) return true;
        return (
          row.process_id.toLowerCase().includes(q) ||
          row.error?.toLowerCase().includes(q) ||
          row.api_process_id?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [rows, query, statusFilter]);

  return (
    <div className="minimal">
      <header className="minimal__topbar">
        <div>
          <h1 className="minimal__title">Audit Log</h1>
          <p className="minimal__subtitle">Vista mínima &middot; hoja "MIC"</p>
        </div>
        <div className="minimal__status">
          {error ? (
            <span className="minimal__pulse minimal__pulse--error" title={error}>
              Sin conexión
            </span>
          ) : (
            <span className="minimal__pulse minimal__pulse--ok">En vivo</span>
          )}
          <button className="minimal__refresh" onClick={onRefresh} disabled={loading}>
            {loading ? "Actualizando…" : "Actualizar"}
          </button>
          {lastUpdated && (
            <span className="minimal__updated mono">
              {lastUpdated.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </header>

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
          </div>
        }
      >
        <FlatLogTable rows={filtered} />
      </Card>
    </div>
  );
}
