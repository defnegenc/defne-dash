import type { ReactNode } from "react";

/**
 * The glass panel: the one surface every module renders into.
 * Heavy glassmorphism lives here and in globals.css — modules never
 * touch visual tokens, so restyling the whole dashboard means editing
 * one component and one stylesheet.
 */
export function GlassPanel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`glass glass-deep p-5 sm:p-6 ${className}`}>
      <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
        {title}
      </h2>
      <div className="flex flex-col gap-4">{children}</div>
    </section>
  );
}
