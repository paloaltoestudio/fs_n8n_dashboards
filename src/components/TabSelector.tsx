import { useSearchParams } from "react-router-dom";
import "./TabSelector.css";

const DEFAULT_VALUE = "__default__";

interface TabSelectorProps {
  /** Every tab currently in the spreadsheet, fetched live — no hardcoded list. */
  tabs: string[];
  /** Current ?tab= value, or null on the default (Firma Seguro) dashboard. */
  currentTab: string | null;
}

export function TabSelector({ tabs, currentTab }: TabSelectorProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <select
      className="tab-selector"
      value={currentTab ?? DEFAULT_VALUE}
      onChange={(e) => {
        const value = e.target.value;
        const next = new URLSearchParams(searchParams);
        if (value === DEFAULT_VALUE) next.delete("tab");
        else next.set("tab", value);
        setSearchParams(next);
      }}
      aria-label="Seleccionar hoja"
    >
      <option value={DEFAULT_VALUE}>Firma Seguro</option>
      {tabs.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
