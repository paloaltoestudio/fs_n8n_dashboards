import type { MicRow } from "../api/types";
import { formatDateTime } from "../lib/format";
import { humanizeError } from "../lib/errorMessage";
import { StatusBadge } from "./StatusBadge";
import "./FlatLogTable.css";

interface FlatLogTableProps {
  rows: MicRow[];
}

export function FlatLogTable({ rows }: FlatLogTableProps) {
  if (rows.length === 0) {
    return <p className="chart-empty">No hay resultados para este filtro.</p>;
  }

  return (
    <div className="flat-log-table">
      <div className="flat-log-table__head">
        <span>Proceso</span>
        <span>Estado</span>
        <span>Error</span>
        <span>API process ID</span>
        <span>Fecha</span>
      </div>
      <div className="flat-log-table__body">
        {rows.map((row) => (
          <div key={`${row.process_id}-${row.timestamp}`} className="flat-log-table__row">
            <span className="mono flat-log-table__id">{row.process_id}</span>
            <span>
              <StatusBadge tone={row.success ? "good" : "critical"} label={row.success ? "Exitoso" : "Fallido"} />
            </span>
            <span className="flat-log-table__error" title={row.error}>
              {humanizeError(row.error) || "—"}
            </span>
            <span className="mono flat-log-table__api-id" title={row.api_process_id}>
              {row.api_process_id || "—"}
            </span>
            <span className="mono flat-log-table__time">{formatDateTime(row.timestamp)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
