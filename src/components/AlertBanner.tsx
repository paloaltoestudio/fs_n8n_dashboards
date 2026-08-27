import type { ReactNode } from "react";
import type { StatusTone } from "../lib/waba";
import "./AlertBanner.css";

interface AlertBannerProps {
  tone: StatusTone;
  title: string;
  description: ReactNode;
}

export function AlertBanner({ tone, title, description }: AlertBannerProps) {
  return (
    <div className={`alert-banner alert-banner--${tone}`} role="alert">
      <span className="alert-banner__icon" aria-hidden="true">
        !
      </span>
      <div>
        <p className="alert-banner__title">{title}</p>
        <p className="alert-banner__description">{description}</p>
      </div>
    </div>
  );
}
