import type { MicRow } from "../api/types";
import { humanizeError } from "./errorMessage";
import { formatDateTime } from "./format";

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCsv(headers: string[], rows: string[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvField).join(","));
  return lines.join("\r\n");
}

function downloadCsv(filename: string, content: string): void {
  // Leading BOM so Excel opens UTF-8 (accents, ñ) correctly instead of mangling it.
  const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Exports MIC-shaped rows (MIC, logs, or any per-client dataset) as a CSV download. */
export function exportRowsToCsv(filenamePrefix: string, rows: MicRow[]): void {
  const headers = ["process_id", "estado", "error", "error_resumen", "api_process_id", "fecha"];
  const csvRows = rows.map((row) => [
    row.process_id,
    row.success ? "Exitoso" : "Fallido",
    row.error ?? "",
    humanizeError(row.error),
    row.api_process_id ?? "",
    formatDateTime(row.timestamp),
  ]);

  const date = new Date().toISOString().slice(0, 10);
  downloadCsv(`${filenamePrefix}-${date}.csv`, toCsv(headers, csvRows));
}
