import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyBucket } from "../../lib/mic";
import { formatDay } from "../../lib/format";
import "./charts.css";

interface AttemptsChartProps {
  data: DailyBucket[];
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{formatDay(label)}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} className="chart-tooltip__row">
          <span className="chart-tooltip__swatch" style={{ background: entry.fill }} />
          {entry.name}
          <span className="tabular chart-tooltip__value">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

function renderLegend() {
  return (
    <div className="chart-legend">
      <span className="chart-legend__item">
        <span className="chart-legend__swatch" style={{ background: "var(--status-good)" }} />
        Exitosos
      </span>
      <span className="chart-legend__item">
        <span className="chart-legend__swatch" style={{ background: "var(--status-critical)" }} />
        Fallidos
      </span>
    </div>
  );
}

export function AttemptsChart({ data }: AttemptsChartProps) {
  if (data.length === 0) {
    return <p className="chart-empty">Aún no hay intentos registrados.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barCategoryGap={data.length > 10 ? "20%" : "40%"}>
        <CartesianGrid stroke="var(--gridline)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDay}
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={{ stroke: "var(--baseline)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "var(--text-muted)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={28}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Legend content={renderLegend} />
        <Bar
          dataKey="success"
          name="Exitosos"
          stackId="attempts"
          fill="var(--status-good)"
          stroke="var(--surface-card)"
          strokeWidth={2}
          radius={[0, 0, 0, 0]}
          maxBarSize={36}
        />
        <Bar
          dataKey="failed"
          name="Fallidos"
          stackId="attempts"
          fill="var(--status-critical)"
          stroke="var(--surface-card)"
          strokeWidth={2}
          radius={[4, 4, 0, 0]}
          maxBarSize={36}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
