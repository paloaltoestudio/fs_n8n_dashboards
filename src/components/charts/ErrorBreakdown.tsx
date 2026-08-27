import type { ErrorBreakdownEntry } from "../../lib/mic";
import "./ErrorBreakdown.css";

interface ErrorBreakdownProps {
  entries: ErrorBreakdownEntry[];
}

export function ErrorBreakdown({ entries }: ErrorBreakdownProps) {
  if (entries.length === 0) {
    return <p className="chart-empty">No hay solicitudes fallando actualmente. 🎉</p>;
  }

  const max = entries[0].count;

  return (
    <ul className="error-breakdown">
      {entries.map((entry) => (
        <li key={entry.reason} className="error-breakdown__row">
          <span className="error-breakdown__reason" title={entry.reason}>
            {entry.reason}
          </span>
          <div className="error-breakdown__bar-track">
            <div
              className="error-breakdown__bar-fill"
              style={{ width: `${Math.max((entry.count / max) * 100, 6)}%` }}
            />
          </div>
          <span className="error-breakdown__count tabular">{entry.count}</span>
        </li>
      ))}
    </ul>
  );
}
