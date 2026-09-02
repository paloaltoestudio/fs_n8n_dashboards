import { Route, Routes, useSearchParams } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Mic } from "./pages/Mic";
import { Minimal } from "./pages/Minimal";
import { useDashboardData } from "./lib/useAuditData";
import { getClient } from "./lib/clients";
import "./App.css";

export default function App() {
  const [searchParams] = useSearchParams();
  const clienteSlug = searchParams.get("cliente");
  const isMinimal = searchParams.has("minimal");
  const client = getClient(clienteSlug);

  const { data: result, error, loading, lastUpdated, refresh } = useDashboardData(clienteSlug);

  if (client) {
    return (
      <DataGate data={result} loading={loading} error={error}>
        {(r) =>
          r.kind === "client" && (
            <Minimal
              rows={r.rows}
              title={r.label}
              subtitle={`Vista mínima · hoja "${client.dataKey}"`}
              lastUpdated={lastUpdated}
              loading={loading}
              error={error}
              onRefresh={refresh}
            />
          )
        }
      </DataGate>
    );
  }

  if (isMinimal) {
    return (
      <DataGate data={result} loading={loading} error={error}>
        {(r) =>
          r.kind === "default" && (
            <Minimal rows={r.data.MIC} lastUpdated={lastUpdated} loading={loading} error={error} onRefresh={refresh} />
          )
        }
      </DataGate>
    );
  }

  return (
    <Routes>
      <Route element={<Layout lastUpdated={lastUpdated} loading={loading} error={error} onRefresh={refresh} />}>
        <Route
          index
          element={
            <DataGate data={result} loading={loading} error={error}>
              {(r) => r.kind === "default" && <Home data={r.data} />}
            </DataGate>
          }
        />
        <Route
          path="/mic"
          element={
            <DataGate data={result} loading={loading} error={error}>
              {(r) => r.kind === "default" && <Mic data={r.data} />}
            </DataGate>
          }
        />
      </Route>
    </Routes>
  );
}

interface DataGateProps<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  children: (data: T) => React.ReactNode;
}

function DataGate<T>({ data, loading, error, children }: DataGateProps<T>) {
  if (error && !data) {
    return (
      <div className="state-panel state-panel--error">
        <h2>No se pudo conectar con n8n</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="state-panel">
        <h2>Cargando datos…</h2>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="state-panel">
        <h2>Sin datos todavía</h2>
      </div>
    );
  }

  return <>{children(data)}</>;
}
