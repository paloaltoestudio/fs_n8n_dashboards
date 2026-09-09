import { useSearchParams } from "react-router-dom";
import "./EnvSelector.css";

export type Env = "test" | "prod";

interface EnvSelectorProps {
  currentEnv: Env;
}

export function EnvSelector({ currentEnv }: EnvSelectorProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <select
      className={`env-selector env-selector--${currentEnv}`}
      value={currentEnv}
      onChange={(e) => {
        const value = e.target.value as Env;
        const next = new URLSearchParams(searchParams);
        if (value === "test") next.delete("env");
        else next.set("env", value);
        setSearchParams(next);
      }}
      aria-label="Seleccionar entorno"
    >
      <option value="test">TEST</option>
      <option value="prod">PROD</option>
    </select>
  );
}
