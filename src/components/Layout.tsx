import { NavLink, Outlet } from "react-router-dom";
import { TabSelector } from "./TabSelector";
import { EnvSelector, type Env } from "./EnvSelector";
import "./Layout.css";

interface LayoutProps {
  tabs: string[];
  currentTab?: string | null;
  currentEnv: Env;
  lastUpdated: Date | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function Layout({ tabs, currentTab = null, currentEnv, lastUpdated, loading, error, onRefresh }: LayoutProps) {
  return (
    <div className="shell">
      <header className="shell__topbar">
        <div className="shell__brand">
          <span className="shell__brand-mark" aria-hidden="true" />
          <div>
            <h1 className="shell__title">Audit Dashboard</h1>
            <p className="shell__subtitle">Firma Seguro &middot; n8n flows</p>
          </div>
        </div>

        <nav className="shell__nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Overview
          </NavLink>
          {/* Hidden for now — route at /mic still works, just not linked from nav. */}
        </nav>

        <div className="shell__status">
          <EnvSelector currentEnv={currentEnv} />
          <TabSelector tabs={tabs} currentTab={currentTab} />
          {error ? (
            <span className="shell__pulse shell__pulse--error" title={error}>
              Sin conexión
            </span>
          ) : (
            <span className="shell__pulse shell__pulse--ok">En vivo</span>
          )}
          <button className="shell__refresh" onClick={onRefresh} disabled={loading}>
            {loading ? "Actualizando…" : "Actualizar"}
          </button>
          {lastUpdated && (
            <span className="shell__updated mono">
              {lastUpdated.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </header>

      <main className="shell__content">
        <Outlet />
      </main>
    </div>
  );
}
