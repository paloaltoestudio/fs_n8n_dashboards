function tryParseJSON(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch {
    return undefined;
  }
}

/**
 * Turns raw n8n error strings into a short, human-readable message.
 *
 * Handles three shapes, each falling back to the next if it doesn't match:
 * 1. Plain text (e.g. phone validation errors) — returned as-is.
 * 2. An AxiosError JSON blob whose `.message` is `"<status> - \"<json>\""`,
 *    where the nested JSON has a `detail` field — returns `"<status> · <detail>"`.
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
      if (innerObj && typeof innerObj === "object" && "detail" in innerObj) {
        const detail = String((innerObj as Record<string, unknown>).detail);
        return `${status} · ${detail}`;
      }
    }
  }

  return message;
}
