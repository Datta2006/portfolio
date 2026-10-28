import type { ReactNode } from "react";
import { ScrollGhost } from "./motion-primitives";

/* Shared journal masthead: outlined chapter index, label, oversized
   title, and a technical rule. Each section below it composes its own
   layout, so the masthead is the through-line, not a repeated card. */
export function SectionHeader({
  index,
  label,
  meta,
  children,
  className = "",
}: {
  index: string;
  label: string;
  meta: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <header className={`section-head ${className}`.trim()}>
      <div className="section-head-rail">
        <ScrollGhost className="section-ghost">{index}</ScrollGhost>
        <span className="mono section-head-label">{label}</span>
      </div>
      <div className="section-head-main">
        <h2 className="section-title">{children}</h2>
        <div className="section-meta">
          <span className="mono">{meta}</span>
          <span className="mono">CH.{index} / 05</span>
        </div>
      </div>
    </header>
  );
}
