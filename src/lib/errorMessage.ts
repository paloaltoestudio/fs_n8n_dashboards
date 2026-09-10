function tryParseJSON(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return undefined;
  }
}

/**
 * Unwraps the `"<status> - \"<json>\""` pattern (e.g. `500 - "{...}"`) that
 * n8n's HTTP error messages come in, regardless of whether it's the raw
 * string on its own (new logging) or nested inside an outer `.message`
 * field (old logging, still present on older sheet rows).
 */
function extractNestedApiError(text: string): { status: string; obj: Record<string, unknown> } | undefined {
  const match = text.match(/^(\d+)\s*-\s*(".*")$/s);
  if (!match) return undefined;

  const innerString = tryParseJSON(match[2]);
  if (typeof innerString !== "string") return undefined;

  const innerObj = tryParseJSON(innerString);
  if (innerObj && typeof innerObj === "object") {
    return { status: match[1], obj: innerObj as Record<string, unknown> };
  }
  return undefined;
}

/** Flattens an ASP.NET-style validation `errors` object into "field: message; field: message". */
function summarizeValidationErrors(errors: unknown): string | undefined {
  if (!errors || typeof errors !== "object") return undefined;

  const parts: string[] = [];
  for (const [field, value] of Object.entries(errors as Record<string, unknown>)) {
    const messages = Array.isArray(value)
      ? value.filter((v): v is string => typeof v === "string")
      : typeof value === "string"
        ? [value]
        : [];
    if (messages.length) parts.push(`${field}: ${messages.join(" ")}`);
  }

  return parts.length ? parts.join("; ") : undefined;
}

/** Picks the most useful human-readable field off a parsed API error body. */
function summarizeInnerError(innerObj: Record<string, unknown>): string | undefined {
  if (typeof innerObj.detail === "string" && innerObj.detail) {
    return innerObj.detail;
  }
  const validationSummary = summarizeValidationErrors(innerObj.errors);
  if (validationSummary) {
    return validationSummary;
  }
  if (typeof innerObj.title === "string" && innerObj.title) {
    return innerObj.title;
  }
  return undefined;
}

/**
 * Turns raw n8n error strings into a short, human-readable message — just the
 * `detail` (or validation `errors`/`title` if that's all that's available),
 * with no status code or JSON noise.
 *
 * Handles these shapes, each falling back to the next if it doesn't match:
 * 1. The bare `"<status> - \"<json>\""` pattern (current logging) — unwrapped
 *    directly, picking `detail`/validation `errors`/`title` off the nested JSON.
 * 2. The same pattern nested inside an outer `{"message": "...", ...}` object
 *    (older sheet rows, from before the logging expression was fixed).
 * 3. Plain text (e.g. phone validation errors) — returned as-is.
 *
 * The original raw string is never discarded by the caller; this only
 * produces the short summary text, callers should keep `raw` around (e.g.
 * as a tooltip) for anyone who needs the full stack trace or traceId.
 */
export function humanizeError(raw: string | undefined | null): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const direct = extractNestedApiError(trimmed);
  if (direct) {
    const summary = summarizeInnerError(direct.obj);
    if (summary) return summary;
  }

  const outer = tryParseJSON(trimmed);
  if (outer && typeof outer === "object") {
    const message = (outer as Record<string, unknown>).message;
    if (typeof message === "string") {
      const nested = extractNestedApiError(message);
      if (nested) {
        const summary = summarizeInnerError(nested.obj);
        if (summary) return summary;
      }
      return message;
    }
  }

  return trimmed;
}

/**
 * Pretty-prints whatever structure is in `raw` for the expanded view — instead
 * of picking one field (which breaks every time an upstream API introduces a
 * slightly different error shape), just show the whole parsed object, nicely
 * indented. Falls back one level at a time down to the raw text if nothing
 * parses as JSON at all.
 */
export function prettyPrintError(raw: string | undefined | null): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const direct = extractNestedApiError(trimmed);
  if (direct) return JSON.stringify(direct.obj, null, 2);

  const outer = tryParseJSON(trimmed);
  if (!outer || typeof outer !== "object") return trimmed;

  const message = (outer as Record<string, unknown>).message;
  if (typeof message === "string") {
    const nested = extractNestedApiError(message);
    if (nested) return JSON.stringify(nested.obj, null, 2);
  }

  // No nested API error found — pretty-print the outer object, dropping the
  // stack trace (huge, not useful for triage) if present.
  const { stack, ...rest } = outer as Record<string, unknown>;
  return JSON.stringify(rest, null, 2);
}
