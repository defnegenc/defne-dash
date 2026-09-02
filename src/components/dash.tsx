"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

export type NewsItem = { title: string; source: string; url: string };
export type Pr = {
  number: number;
  label: string;
  author: string;
  state: "merged" | "ready" | "stale";
  url: string;
};
export type Curiosity = { slug: string; question: string };

type SectionId = "news" | "prs" | "ideas";
type Pos = { x: number; y: number };

const POS_KEY = "defne-dash-positions-v1";
const BOX_KEY = "defne-dash-boxed-v1";

const DEFAULT_POS: Record<SectionId, Pos> = {
  news: { x: 0, y: 0 },
  prs: { x: 0, y: 260 },
  ideas: { x: 0, y: 520 },
};
const WIDTHS: Record<SectionId, string> = {
  news: "w-[540px]",
  prs: "w-[440px]",
  ideas: "w-[380px]",
};
const LABELS: Record<SectionId, string> = {
  news: "news",
  prs: "pr pile",
  ideas: "ideas ✦",
};
const BOXABLE: SectionId[] = ["news", "prs"];

const PR_STYLE: Record<Pr["state"], { tone: string; mark: string; word: string }> = {
  merged: { tone: "tone-gray", mark: "✓", word: "merged" },
  ready: { tone: "tone-ready", mark: "↗", word: "ready to merge" },
  stale: { tone: "tone-stale", mark: "!", word: "stale - merge it or close it" },
};

function Grip() {
  return (
    <span className="text-ink-soft opacity-0 transition-opacity duration-150 group-hover:opacity-70">
      <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden>
        <circle cx="2.5" cy="2.5" r="1.4" />
        <circle cx="7.5" cy="2.5" r="1.4" />
        <circle cx="2.5" cy="8" r="1.4" />
        <circle cx="7.5" cy="8" r="1.4" />
        <circle cx="2.5" cy="13.5" r="1.4" />
        <circle cx="7.5" cy="13.5" r="1.4" />
      </svg>
    </span>
  );
}

export function Dash({
  news,
  prs,
  curiosities,
  fixedLine,
}: {
  news: NewsItem[];
  prs: Pr[];
  curiosities: Curiosity[];
  fixedLine: string;
}) {
  const [desktop, setDesktop] = useState(false);
  const [pos, setPos] = useState<Record<SectionId, Pos>>(DEFAULT_POS);
  const [boxed, setBoxed] = useState<Record<SectionId, boolean>>({
    news: true,
    prs: true,
    ideas: false,
  });
  const [squash, setSquash] = useState<SectionId | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    try {
      const p = JSON.parse(window.localStorage.getItem(POS_KEY) ?? "null");
      if (p && typeof p === "object") setPos({ ...DEFAULT_POS, ...p });
      const b = JSON.parse(window.localStorage.getItem(BOX_KEY) ?? "null");
      if (b && typeof b === "object") setBoxed((prev) => ({ ...prev, ...b }));
    } catch {}
    return () => mq.removeEventListener("change", update);
  }, []);

  function drop(id: SectionId, offset: Pos) {
    setPos((prev) => {
      const next = { ...prev, [id]: { x: prev[id].x + offset.x, y: prev[id].y + offset.y } };
      try {
        window.localStorage.setItem(POS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    setSquash(id);
  }

  function toggleBox(id: SectionId) {
    setBoxed((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        window.localStorage.setItem(BOX_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function content(id: SectionId) {
    if (id === "news") {
      const rows = news.map((item) => (
        <a
          key={item.title}
          href={item.url}
          className={
            boxed.news
              ? "glass-inset group/row flex items-center justify-between gap-4 px-4 py-3"
              : "group/row flex items-center justify-between gap-4 px-1 py-1.5"
          }
        >
          <span className="text-sm text-ink">
            {item.title}
            <span className="ml-2 text-xs text-ink-soft">{item.source}</span>
          </span>
          <span className="text-ink-soft transition-transform group-hover/row:translate-x-0.5">→</span>
        </a>
      ));
      return boxed.news ? (
        <div className="flex flex-col gap-2">{rows}</div>
      ) : (
        <div className="flex flex-col divide-y divide-white/40">{rows}</div>
      );
    }
    if (id === "prs") {
      const chips = prs.map((pr) => {
        const st = PR_STYLE[pr.state];
        return (
          <a
            key={pr.number}
            href={pr.url}
            className={`glass-chip ${st.tone} px-2.5 py-1 text-xs`}
            title={`${pr.label} · ${pr.author === "agent" ? "agent" : "you"} · ${st.word}`}
          >
            <span className="mr-1 font-semibold">{st.mark}</span>
            <span className="font-semibold text-ink">PR {pr.number}</span>
            <span className="ml-1.5 text-ink-soft">{pr.label}</span>
          </a>
        );
      });
      return (
        <>
          <p className="mb-2.5 text-xs text-ink-soft">{fixedLine}</p>
          {boxed.prs ? (
            <div className="glass glass-deep flex flex-wrap gap-2 p-4">{chips}</div>
          ) : (
            <div className="flex flex-wrap gap-2">{chips}</div>
          )}
        </>
      );
    }
    return (
      <div className="flex flex-col gap-1.5">
        {curiosities.map((c) => (
          <a
            key={c.slug}
            href={`/curiosities/${c.slug}`}
            className="text-sm text-ink underline-offset-4 hover:underline"
          >
            → {c.question}
          </a>
        ))}
      </div>
    );
  }

  function header(id: SectionId, draggable: boolean) {
    return (
      <div className="mb-3 flex items-center gap-2">
        {draggable && <Grip />}
        <h2 className="font-display text-xl lowercase text-ink">{LABELS[id]}</h2>
        {BOXABLE.includes(id) && (
          <button
            onClick={() => toggleBox(id)}
            className="glass-chip px-2 py-0.5 text-[10px] text-ink-soft opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          >
            {boxed[id] ? "unbox" : "box"}
          </button>
        )}
      </div>
    );
  }

  if (!desktop) {
    return (
      <div className="mt-12 flex flex-col gap-14">
        {(Object.keys(LABELS) as SectionId[]).map((id) => (
          <section key={id} className="group">
            {header(id, false)}
            {content(id)}
          </section>
        ))}
      </div>
    );
  }

  const boardHeight = Math.max(...Object.values(pos).map((p) => p.y)) + 420;

  return (
    <div className="relative mt-12" style={{ height: boardHeight }}>
      {(Object.keys(LABELS) as SectionId[]).map((id) => (
        <motion.div
          key={id}
          drag
          dragMomentum={false}
          whileDrag={{ scale: 1.02, rotate: 0.4 }}
          animate={{ x: pos[id].x, y: pos[id].y }}
          transition={{ type: "spring", stiffness: 320, damping: 15, mass: 0.9 }}
          onDragEnd={(_, info) => drop(id, { x: info.offset.x, y: info.offset.y })}
          className={`group absolute cursor-grab active:cursor-grabbing ${WIDTHS[id]}`}
          style={{ touchAction: "none" }}
        >
          <motion.div
            animate={squash === id ? { scaleY: [1, 0.94, 1.03, 1], scaleX: [1, 1.04, 0.99, 1] } : { scaleY: 1, scaleX: 1 }}
            transition={{ duration: 0.5, times: [0, 0.4, 0.72, 1], ease: "easeOut" }}
            onAnimationComplete={() => setSquash((s) => (s === id ? null : s))}
          >
            {header(id, true)}
            {content(id)}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
