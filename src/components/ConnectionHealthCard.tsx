import type { WabaQualityRow } from "../api/types";
import { qualityTone, connectionTone } from "../lib/waba";
import { formatDateTime, formatRelative } from "../lib/format";
import { StatusBadge } from "./StatusBadge";
import "./ConnectionHealthCard.css";

interface ConnectionHealthCardProps {
  latest: WabaQualityRow | null;
}

export function ConnectionHealthCard({ latest }: ConnectionHealthCardProps) {
  if (!latest) {
    return (
      <div className="health-card health-card--muted">
        <p>Sin datos de calidad de WABA todavía.</p>
      </div>
    );
  }

  const qTone = qualityTone(latest.quality_rating);
  const cTone = connectionTone(latest.status);
  const worst = cTone === "critical" || qTone === "critical" ? "critical" : qTone === "warning" || cTone === "warning" ? "warning" : "good";

  return (
    <div className={`health-card health-card--${worst}`}>
      <div className="health-card__main">
        <span className="health-card__eyebrow">Estado de WhatsApp Business API</span>
        <h3 className="health-card__name">{latest.verified_name || "Cuenta sin nombre verificado"}</h3>
        <div className="health-card__badges">
          <StatusBadge tone={qTone} label={`Calidad ${latest.quality_rating || "desconocida"}`} />
          <StatusBadge tone={cTone} label={latest.status || "estado desconocido"} />
        </div>
      </div>
      <div className="health-card__meta">
        <span className="mono">{formatDateTime(latest.timestamp)}</span>
        <span>{formatRelative(new Date(latest.timestamp))}</span>
      </div>
    </div>
  );
}
