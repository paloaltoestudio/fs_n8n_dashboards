import { Link } from "react-router-dom";
import type { AuditData } from "../api/types";
import { Card } from "../components/Card";
import { StatTile } from "../components/StatTile";
import { ConnectionHealthCard } from "../components/ConnectionHealthCard";
import { AlertBanner } from "../components/AlertBanner";
import { WabaTimeline } from "../components/WabaTimeline";
import { AttemptsChart } from "../components/charts/AttemptsChart";
import { attemptsByDay, groupByProcess, summarize } from "../lib/mic";
import { latestWabaCheck, sortByTimestampDesc } from "../lib/waba";
import { formatPercent } from "../lib/format";
import "./Home.css";

interface HomeProps {
  data: AuditData;
}

export function Home({ data }: HomeProps) {
  const processes = groupByProcess(data.MIC);
  const summary = summarize(processes, data.MIC.length);
  const daily = attemptsByDay(data.MIC);
  const latestCheck = latestWabaCheck(data.waba_quality_checks);
  const history = sortByTimestampDesc(data.waba_quality_checks).slice(0, 6);

  const interrupted = latestCheck?.action_taken?.trim();

  return (
    <div className="home">
      <ConnectionHealthCard latest={latestCheck} />

      {interrupted && (
        <AlertBanner
          tone="critical"
          title="El flujo se interrumpió por calidad de WABA"
          description={
            <>
              Última acción registrada: <strong>{latestCheck?.action_taken}</strong>
              {latestCheck?.last_row && (
                <>
                  {" "}
                  — se detuvo en el proceso <span className="mono">{latestCheck.last_row}</span>.
                  Revisa la pestaña MIC para retomarlo.
                </>
              )}
            </>
          }
        />
      )}

      <div className="home__stats">
        <StatTile label="Solicitudes de firma" value={summary.uniqueRequests} sublabel="Procesos únicos en MIC" />
        <StatTile
          label="Tasa de éxito"
          value={formatPercent(summary.successRate)}
          tone={summary.successRate >= 0.9 ? "good" : summary.successRate >= 0.6 ? "warning" : "critical"}
          sublabel={`${summary.successCount} de ${summary.uniqueRequests} exitosos`}
        />
        <StatTile
          label="Fallando ahora"
          value={summary.failingCount}
          tone={summary.failingCount === 0 ? "good" : "critical"}
          sublabel={
            summary.failingCount === 0 ? (
              "Todo al día"
            ) : (
              <Link to="/mic" className="home__link">
                Ver en MIC →
              </Link>
            )
          }
        />
        <StatTile
          label="Reintentos"
          value={summary.retriedCount}
          sublabel={`${summary.avgAttemptsPerRequest.toFixed(1)} intentos promedio`}
        />
      </div>

      <div className="home__grid">
        <Card title="Volumen de intentos" subtitle="Solicitudes procesadas por día en MIC">
          <AttemptsChart data={daily} />
        </Card>
        <Card title="Historial de calidad WABA" subtitle="Últimas verificaciones de la cuenta">
          <WabaTimeline rows={history} />
        </Card>
      </div>
    </div>
  );
}
