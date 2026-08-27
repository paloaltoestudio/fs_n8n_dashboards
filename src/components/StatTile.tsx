import type { ReactNode } from "react";
import "./StatTile.css";

interface StatTileProps {
  label: string;
  value: ReactNode;
  sublabel?: ReactNode;
  tone?: "default" | "good" | "warning" | "critical";
}

export function StatTile({ label, value, sublabel, tone = "default" }: StatTileProps) {
  return (
    <div className={`stat-tile stat-tile--${tone}`}>
      <span className="stat-tile__label">{label}</span>
      <span className="stat-tile__value tabular">{value}</span>
      {sublabel && <span className="stat-tile__sublabel">{sublabel}</span>}
    </div>
  );
}
