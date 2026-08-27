import type { WabaQualityRow } from "../api/types";
import { qualityTone } from "../lib/waba";
import { formatDateTime } from "../lib/format";
import { StatusBadge } from "./StatusBadge";
import "./WabaTimeline.css";

interface WabaTimelineProps {
  rows: WabaQualityRow[];
}

export function WabaTimeline({ rows }: WabaTimelineProps) {
  if (rows.length === 0) {
    return <p className="chart-empty">Sin registros de calidad todavía.</p>;
  }

  return (
    <ol className="waba-timeline">
      {rows.map((row) => (
        <li key={row.row_number} className="waba-timeline__item">
          <span className={`waba-timeline__dot waba-timeline__dot--${qualityTone(row.quality_rating)}`} />
          <div className="waba-timeline__content">
            <div className="waba-timeline__top">
              <StatusBadge tone={qualityTone(row.quality_rating)} label={row.quality_rating || "—"} />
              <span className="mono waba-timeline__time">{formatDateTime(row.timestamp)}</span>
            </div>
            {row.action_taken && (
              <p className="waba-timeline__action">
                {row.action_taken}
                {row.last_row && <span className="mono"> · {row.last_row}</span>}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
