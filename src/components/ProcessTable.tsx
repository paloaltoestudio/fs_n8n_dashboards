import { useState } from "react";
import type { MicProcess } from "../lib/mic";
import { formatDateTime } from "../lib/format";
import { StatusBadge } from "./StatusBadge";
import { ErrorCell } from "./ErrorCell";
import "./ProcessTable.css";

interface ProcessTableProps {
  processes: MicProcess[];
}

export function ProcessTable({ processes }: ProcessTableProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (processes.length === 0) {
    return <p className="chart-empty">No hay resultados para este filtro.</p>;
  }

  return (
    <div className="process-table">
      <div className="process-table__head">
        <span>Proceso</span>
        <span>Estado</span>
        <span>Último error</span>
        <span>Intentos</span>
        <span>Última actualización</span>
      </div>
      <div className="process-table__body">
        {processes.map((p) => {
          const isOpen = expanded.has(p.processId);
          return (
            <div key={p.processId} className="process-table__group">
              <button
                className="process-table__row"
                onClick={() => toggle(p.processId)}
                aria-expanded={isOpen}
              >
                <span className="mono process-table__id">
                  <span className={`process-table__chevron ${isOpen ? "is-open" : ""}`}>›</span>
                  {p.processId}
                </span>
                <span>
                  <StatusBadge
                    tone={p.latest.success ? "good" : "critical"}
                    label={p.latest.success ? "Exitoso" : "Fallido"}
                  />
                </span>
                <ErrorCell raw={p.latest.error} />
                <span className="tabular">
                  {p.attemptCount}
                  {p.attemptCount > 1 && <span className="process-table__retry-tag">retry</span>}
                </span>
                <span className="mono process-table__time">
                  {formatDateTime(p.latest.timestamp)}
                </span>
              </button>

              {isOpen && (
                <div className="process-table__history">
                  {p.attempts.map((attempt, idx) => (
                    <div key={attempt.row_number} className="process-table__history-row">
                      <span className="process-table__history-index tabular">#{idx + 1}</span>
                      <StatusBadge
                        tone={attempt.success ? "good" : "critical"}
                        label={attempt.success ? "Exitoso" : "Fallido"}
                      />
                      <ErrorCell raw={attempt.error} emptyText="Sin mensaje" />
                      <span
                        className="process-table__history-waba mono"
                        title={attempt.api_process_id}
                      >
                        API ID: {attempt.api_process_id || "—"}
                      </span>
                      <span className="mono process-table__time">
                        {formatDateTime(attempt.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
