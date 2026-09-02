function tryParseJSON(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return undefined;
  }
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
 * Turns raw n8n error strings into a short, human-readable message.
 *
 * Handles three shapes, each falling back to the next if it doesn't match:
 * 1. Plain text (e.g. phone validation errors) — returned as-is.
 * 2. An AxiosError JSON blob whose `.message` is `"<status> - \"<json>\""`,
 *    where the nested JSON exposes `detail`, a validation `errors` object,
 *    or a `title` (checked in that order) — returns `"<status> · <summary>"`.
 * 3. Any other JSON object with a `.message` field — returns that message.
 *
 * The original raw string is never discarded by the caller; this only
 * produces the short summary text, callers should keep `raw` around (e.g.
 * as a tooltip) for anyone who needs the full stack trace or traceId.
 */
export function humanizeError(raw: string | undefined | null): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const outer = tryParseJSON(trimmed);
  if (!outer || typeof outer !== "object") {
    return trimmed;
  }

  const message = (outer as Record<string, unknown>).message;
  if (typeof message !== "string") {
    return trimmed;
  }

  const nestedMatch = message.match(/^(\d+)\s*-\s*(".*")$/s);
  if (nestedMatch) {
    const [, status, quotedJson] = nestedMatch;
    const innerString = tryParseJSON(quotedJson);
    if (typeof innerString === "string") {
      const innerObj = tryParseJSON(innerString);
      if (innerObj && typeof innerObj === "object") {
        const summary = summarizeInnerError(innerObj as Record<string, unknown>);
        if (summary) {
          return `${status} · ${summary}`;
        }
      }
    }
  }

  return message;
}
