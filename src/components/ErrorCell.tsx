import { useState } from "react";
import { humanizeError } from "../lib/errorMessage";
import "./ErrorCell.css";

interface ErrorCellProps {
  /** The raw, original error string (used for the tooltip and the copy button). */
  raw: string | undefined;
  /** Shown when `raw` is empty. */
  emptyText?: string;
}

export function ErrorCell({ raw, emptyText = "—" }: ErrorCellProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasContent = Boolean(raw?.trim());
  const text = humanizeError(raw) || emptyText;

  function toggleExpanded(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation();
    if (hasContent) setExpanded((v) => !v);
  }

  async function handleCopy(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation();
    if (!raw) return;
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable or permission denied — nothing we can do here.
    }
  }

  return (
    <div
      className={`error-cell ${expanded ? "is-expanded" : ""}`}
      onClick={toggleExpanded}
      role={hasContent ? "button" : undefined}
      tabIndex={hasContent ? 0 : undefined}
      onKeyDown={(e) => {
        if (hasContent && (e.key === "Enter" || e.key === " ")) toggleExpanded(e);
      }}
      title={!expanded ? raw : undefined}
    >
      <span className="error-cell__text">{text}</span>
      {hasContent && (
        <span
          className="error-cell__copy"
          role="button"
          tabIndex={0}
          aria-label="Copiar error completo"
          title="Copiar error completo"
          onClick={handleCopy}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleCopy(e);
          }}
        >
          {copied ? "✓" : "⧉"}
        </span>
      )}
    </div>
  );
}
