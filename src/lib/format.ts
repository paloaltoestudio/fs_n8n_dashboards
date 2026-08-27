const dateTimeFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const dayFormatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
});

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return dateTimeFormatter.format(d);
}

export function formatDay(isoDay: string): string {
  const d = new Date(`${isoDay}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDay;
  return dayFormatter.format(d);
}

export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

export function formatRelative(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return "hace instantes";
  if (diffMin === 1) return "hace 1 minuto";
  if (diffMin < 60) return `hace ${diffMin} minutos`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr === 1) return "hace 1 hora";
  return `hace ${diffHr} horas`;
}
