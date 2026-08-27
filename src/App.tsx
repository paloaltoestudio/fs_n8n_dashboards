import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Mic } from "./pages/Mic";
import { useAuditData } from "./lib/useAuditData";
import "./App.css";

export default function App() {
  const { data, error, loading, lastUpdated, refresh } = useAuditData();

  return (
    <Routes>
      <Route element={<Layout lastUpdated={lastUpdated} loading={loading} error={error} onRefresh={refresh} />}>
        <Route
          index
          element={
            <DataGate data={data} loading={loading} error={error}>
              {(d) => <Home data={d} />}
            </DataGate>
          }
        />
        <Route
          path="/mic"
          element={
            <DataGate data={data} loading={loading} error={error}>
              {(d) => <Mic data={d} />}
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
