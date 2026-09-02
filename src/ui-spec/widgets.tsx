import type { ReactNode } from "react";

/**
 * UI mapping rules: render type -> widget. This is the rule table the
 * renderer consults (paper §5.2.3). Add a render type here and every
 * attribute annotated with it gains a widget.
 */

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-ink-soft">{label}</span>
      {children}
    </div>
  );
}

export function TextWidget({ label, value }: { label: string; value: unknown }) {
  return (
    <Row label={label}>
      <p className="text-[15px] leading-snug font-medium text-ink">
        {typeof value === "string" && value ? value : "—"}
      </p>
    </Row>
  );
}

export function TimeWidget({ label, value }: { label: string; value: unknown }) {
  return (
    <Row label={label}>
      <p className="text-sm text-ink">{typeof value === "string" && value ? value : "—"}</p>
    </Row>
  );
}

export function LinkWidget({ label, value }: { label: string; value: unknown }) {
  if (typeof value !== "string" || !value) return null;
  return (
    <a
      href={value}
      target="_blank"
      rel="noreferrer"
      className="glass-chip inline-flex w-fit items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink transition hover:bg-white/60"
    >
      {label} <span aria-hidden>↗</span>
    </a>
  );
}

const BADGE_TONE: Record<string, string> = {
  "on track": "text-emerald-900 bg-emerald-200/40 border-emerald-100/60",
  "duplicate fire": "text-amber-900 bg-amber-200/40 border-amber-100/60",
  unreachable: "text-slate-700 bg-slate-200/40 border-slate-100/60",
};

export function BadgeWidget({ label, value }: { label: string; value: unknown }) {
  const text = typeof value === "string" && value ? value : "unknown";
  const tone = BADGE_TONE[text] ?? BADGE_TONE.unreachable;
  return (
    <Row label={label}>
      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium backdrop-blur-md ${tone}`}
      >
        <span className="size-1.5 rounded-full bg-current opacity-60" />
        {text}
      </span>
    </Row>
  );
}

export function StatWidget({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="glass-inset flex flex-col gap-0.5 px-4 py-3">
      <span className="text-2xl font-semibold tracking-tight text-ink">
        {typeof value === "number" ? value : "—"}
      </span>
      <span className="text-[11px] text-ink-soft">{label}</span>
    </div>
  );
}

interface ThumbProps {
  label: string;
  items: unknown;
  thumbnail: string[];
  variant: "list" | "feed" | "summary";
  expanded?: boolean;
}

/** ARRY renderer: expanded lists, feeds, and summary roll-ups. */
export function CollectionWidget({ label, items, thumbnail, variant, expanded }: ThumbProps) {
  const rows = Array.isArray(items) ? (items as Record<string, unknown>[]) : [];

  if (variant === "summary") {
    return (
      <Row label={label}>
        <ul className="flex flex-col gap-1.5">
          {rows.map((r, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate text-ink">{String(r[thumbnail[0]] ?? "")}</span>
              <span className="shrink-0 text-xs text-ink-soft">
                {String(r[thumbnail[1]] ?? "")}
              </span>
            </li>
          ))}
          {rows.length === 0 && <li className="text-sm text-ink-soft">nothing open</li>}
        </ul>
      </Row>
    );
  }

  if (variant === "feed") {
    return (
      <Row label={label}>
        <ul className="flex flex-col gap-2">
          {rows.map((r, i) => (
            <li key={i}>
              <a
                href={typeof r.url === "string" ? r.url : undefined}
                target="_blank"
                rel="noreferrer"
                className="glass-inset group flex flex-col gap-1 px-3.5 py-2.5 transition hover:bg-white/50"
              >
                <span className="text-sm leading-snug font-medium text-ink group-hover:underline">
                  {String(r.title ?? "")}
                </span>
                <span className="flex items-center gap-2 text-[11px] text-ink-soft">
                  <span>{String(r.source ?? "")}</span>
                  <span aria-hidden>·</span>
                  <span>{String(r.engagedAt ?? r.publishedAt ?? "")}</span>
                </span>
                {expanded && typeof r.detail === "string" && r.detail && (
                  <span className="text-xs leading-snug text-ink-soft">{r.detail}</span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </Row>
    );
  }

  // expanded list
  return (
    <Row label={label}>
      <ul className="flex flex-col gap-1.5">
        {rows.map((r, i) => {
          const body = (
            <>
              <span className="text-xs text-ink-soft">{String(r[thumbnail[0]] ?? "")}</span>
              <span className="truncate text-sm text-ink">{String(r[thumbnail[1]] ?? "")}</span>
            </>
          );
          return (
            <li key={i}>
              {typeof r.url === "string" ? (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-inset flex items-baseline gap-3 px-3 py-2 transition hover:bg-white/50"
                >
                  {body}
                </a>
              ) : (
                <div className="glass-inset flex items-baseline gap-3 px-3 py-2">{body}</div>
              )}
            </li>
          );
        })}
        {rows.length === 0 && <li className="text-sm text-ink-soft">—</li>}
      </ul>
    </Row>
  );
}

const PR_TONE: Record<string, string> = {
  green: "tone-green",
  amber: "tone-amber",
  gray: "tone-gray",
};

/** The PR pile: one long stack, three-word label + number + whose it is. */
export function PrPileWidget({
  label,
  items,
  expanded,
}: {
  label: string;
  items: unknown;
  expanded?: boolean;
}) {
  const rows = Array.isArray(items) ? (items as Record<string, unknown>[]) : [];
  return (
    <Row label={label}>
      <ul className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <li
            key={i}
            className={`glass-inset flex items-center justify-between gap-3 px-3.5 py-2.5 ${PR_TONE[String(r.tone)] ?? ""}`}
          >
            <span className="flex items-baseline gap-2.5">
              <span className="text-sm font-medium text-ink">{String(r.label ?? "")}</span>
              <span className="text-[11px] text-ink-soft">
                {String(r.number ?? "")} · {String(r.author ?? "")}
              </span>
            </span>
            <a
              href={typeof r.url === "string" ? r.url : undefined}
              target="_blank"
              rel="noreferrer"
              className="glass-chip shrink-0 px-2.5 py-1 text-[11px] font-medium text-ink transition hover:bg-white/60"
            >
              {String(r.number ?? "pr")} <span aria-hidden>↗</span>
            </a>
          </li>
        ))}
        {rows.length === 0 && <li className="text-sm text-ink-soft">pile is empty</li>}
      </ul>
    </Row>
  );
}
