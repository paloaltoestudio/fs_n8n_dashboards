import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

interface LayoutProps {
  lastUpdated: Date | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function Layout({ lastUpdated, loading, error, onRefresh }: LayoutProps) {
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
          <NavLink to="/mic" className={({ isActive }) => (isActive ? "active" : "")}>
            MIC &middot; Firma Digital
          </NavLink>
        </nav>

        <div className="shell__status">
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
