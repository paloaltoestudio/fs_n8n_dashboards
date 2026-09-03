import { useMemo, useState } from "react";
import type { AuditData } from "../api/types";
import { Card } from "../components/Card";
import { StatTile } from "../components/StatTile";
import { AttemptsChart } from "../components/charts/AttemptsChart";
import { ErrorBreakdown } from "../components/charts/ErrorBreakdown";
import { ProcessTable } from "../components/ProcessTable";
import { attemptsByDay, errorBreakdown, groupByProcess, summarize } from "../lib/mic";
import { formatPercent } from "../lib/format";
import { exportRowsToCsv } from "../lib/csv";
import "./Mic.css";

interface MicProps {
  data: AuditData;
}

type StatusFilter = "all" | "success" | "failing";

export function Mic({ data }: MicProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const processes = useMemo(() => groupByProcess(data.MIC), [data.MIC]);
  const summary = useMemo(() => summarize(processes, data.MIC.length), [processes, data.MIC.length]);
  const daily = useMemo(() => attemptsByDay(data.MIC), [data.MIC]);
  const breakdown = useMemo(() => errorBreakdown(summary.currentlyFailing), [summary.currentlyFailing]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return processes
      .filter((p) => {
        if (statusFilter === "success" && !p.latest.success) return false;
        if (statusFilter === "failing" && p.latest.success) return false;
        if (!q) return true;
        return (
          p.processId.toLowerCase().includes(q) ||
          p.latest.error?.toLowerCase().includes(q) ||
          p.latest.api_process_id?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.latest.timestamp).getTime() - new Date(a.latest.timestamp).getTime());
  }, [processes, query, statusFilter]);

  return (
    <div className="mic">
      <div className="mic__header">
        <div>
          <h2 className="mic__title">MIC &middot; Firma Digital</h2>
          <p className="mic__subtitle">Auditoría del proceso de solicitud de firma electrónica</p>
        </div>
      </div>

      <div className="mic__stats">
        <StatTile label="Solicitudes únicas" value={summary.uniqueRequests} />
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
        <StatTile label="Intentos totales" value={summary.totalAttempts} />
        <StatTile
          label="Con reintentos"
          value={summary.retriedCount}
          sublabel={`${summary.avgAttemptsPerRequest.toFixed(1)} intentos / solicitud`}
        />
      </div>

      <div className="mic__grid">
        <Card title="Volumen diario" subtitle="Intentos exitosos vs. fallidos">
          <AttemptsChart data={daily} />
        </Card>
        <Card title="Motivos de falla" subtitle="Solicitudes fallando actualmente, agrupadas por error">
          <ErrorBreakdown entries={breakdown} />
        </Card>
      </div>

      <Card
        title="Solicitudes"
        subtitle="Un proceso por solicitud; despliega para ver el historial de reintentos"
        action={
          <div className="mic__filters">
            <div className="mic__toggle">
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
              className="mic__search"
              placeholder="Buscar por proceso o error…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              className="mic__download"
              onClick={() => exportRowsToCsv("mic", filtered.map((p) => p.latest))}
              disabled={filtered.length === 0}
            >
              Descargar CSV
            </button>
          </div>
        }
      >
        <ProcessTable processes={filtered} />
      </Card>
    </div>
  );
}
