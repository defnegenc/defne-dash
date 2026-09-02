"use client";

import { useEffect, useRef, useState } from "react";
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
type Point = { x: number; y: number };
type Block =
  | { kind: "news"; id: string; item: NewsItem }
  | { kind: "pr"; id: string; item: Pr }
  | { kind: "idea"; id: string; item: Curiosity };

const POS_KEY = "defne-dash-positions-v2";
const BOX_KEY = "defne-dash-boxed-v2";
const BUCKET_KEY = "defne-dash-buckets-v1";

const DEFAULT_POS: Record<SectionId, Pos> = {
  news: { x: 0, y: 0 },
  prs: { x: 0, y: 350 },
  ideas: { x: 0, y: 660 },
};
const SECTION_W = "w-full";
const LABELS: Record<SectionId, string> = {
  news: "news",
  prs: "pr pile",
  ideas: "ideas ✦",
};
const SECTION_IDS = Object.keys(LABELS) as SectionId[];

const PR_STYLE: Record<Pr["state"], { tone: string; mark: string; word: string }> = {
  merged: { tone: "tone-gray", mark: "✓", word: "merged" },
  ready: { tone: "tone-ready", mark: "↗", word: "ready to merge" },
  stale: { tone: "tone-stale", mark: "!", word: "stale - merge it or close it" },
};

function GripDots() {
  return (
    <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor" aria-hidden>
      <circle cx="2.5" cy="2.5" r="1.4" />
      <circle cx="7.5" cy="2.5" r="1.4" />
      <circle cx="2.5" cy="8" r="1.4" />
      <circle cx="7.5" cy="8" r="1.4" />
      <circle cx="2.5" cy="13.5" r="1.4" />
      <circle cx="7.5" cy="13.5" r="1.4" />
    </svg>
  );
}

/** One movable block. Notion-style: grab its dots, drop it on any section. */
function BlockView({
  block,
  boxed,
  onDrop,
}: {
  block: Block;
  boxed: boolean;
  onDrop: (id: string, point: Point) => void;
}) {
  const dragging = useRef(false);

  const guardClick = (e: React.MouseEvent) => {
    if (dragging.current) e.preventDefault();
  };

  let body: React.ReactNode;
  if (block.kind === "news") {
    const item = block.item;
    body = (
      <a
        href={item.url}
        onClick={guardClick}
        className={
          boxed
            ? "glass-chip flex w-full items-center justify-between gap-4 px-6 py-3.5 text-base"
            : "flex items-center justify-between gap-4 px-1 py-1.5"
        }
      >
        <span className="text-base font-semibold text-white">
          {item.title}
          <span className="ml-2 text-sm font-normal text-white/90">{item.source}</span>
        </span>
        <span className="text-white/90 transition-transform hover:translate-x-0.5">→</span>
      </a>
    );
  } else if (block.kind === "pr") {
    const pr = block.item;
    const st = PR_STYLE[pr.state];
    body = (
      <a
        href={pr.url}
        onClick={guardClick}
        className={`glass-chip ${st.tone} inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-base`}
        title={`${pr.label} · ${pr.author === "agent" ? "agent" : "you"} · ${st.word}`}
      >
        <span className="font-semibold">{st.mark}</span>
        <span className="font-semibold">PR {pr.number}</span>
        <span className="opacity-95">{pr.label}</span>
      </a>
    );
  } else {
    const c = block.item;
    body = (
      <a
        href={`/curiosities/${c.slug}`}
        onClick={guardClick}
        className={
          boxed
            ? "glass-chip flex w-full items-center gap-2 px-6 py-3.5 text-base font-medium text-white"
            : "px-1 py-1.5 text-sm text-white underline-offset-4 hover:underline"
        }
      >
        → {c.question}
      </a>
    );
  }

  return (
    <motion.div
      drag
      dragPropagation={false}
      dragMomentum={false}
      whileDrag={{ scale: 1.03, zIndex: 40 }}
      animate={{ x: 0, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      onDragStart={() => {
        dragging.current = true;
      }}
      onDragEnd={(_, info) => {
        onDrop(block.id, info.point);
        setTimeout(() => {
          dragging.current = false;
        }, 80);
      }}
      className={`group/block relative flex items-center gap-1.5 ${block.kind === "pr" ? "" : "w-full"}`}
      style={{ touchAction: "none" }}
    >
      <span
        className="absolute -left-1 top-1/2 -translate-y-1/2 text-white/70 opacity-0 transition-opacity duration-150 group-hover/block:opacity-90"
        style={{ touchAction: "none" }}
        aria-hidden
      >
        <GripDots />
      </span>
      <div className="min-w-0 flex-1">{body}</div>
    </motion.div>
  );
}

export function Dash({
  news,
  prs,
  curiosities,
}: {
  news: NewsItem[];
  prs: Pr[];
  curiosities: Curiosity[];
}) {
  const [desktop, setDesktop] = useState(false);
  const [pos, setPos] = useState<Record<SectionId, Pos>>(DEFAULT_POS);
  const [boxed, setBoxed] = useState<Record<SectionId, boolean>>({
    news: true,
    prs: true,
    ideas: true,
  });
  const [buckets, setBuckets] = useState<Record<string, SectionId>>({});
  const [squash, setSquash] = useState<SectionId | null>(null);
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLDivElement | null>>>({});

  const allBlocks: Block[] = [
    ...news.map((item) => ({ kind: "news", id: `n:${item.url}`, item }) as Block),
    ...prs.map((pr) => ({ kind: "pr", id: `p:${pr.number}`, item: pr }) as Block),
    ...curiosities.map((c) => ({ kind: "idea", id: `i:${c.slug}`, item: c }) as Block),
  ];
  const natural: Record<string, SectionId> = {};
  for (const b of allBlocks) {
    natural[b.id] = b.kind === "news" ? "news" : b.kind === "pr" ? "prs" : "ideas";
  }
  const sectionOf = (id: string): SectionId => buckets[id] ?? natural[id];

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
      const bk = JSON.parse(window.localStorage.getItem(BUCKET_KEY) ?? "null");
      if (bk && typeof bk === "object") setBuckets(bk);
    } catch {}
    return () => mq.removeEventListener("change", update);
  }, []);

  function dropSection(id: SectionId, offset: Pos) {
    setPos((prev) => {
      const next = { ...prev, [id]: { x: prev[id].x + offset.x, y: prev[id].y + offset.y } };
      try {
        window.localStorage.setItem(POS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    setSquash(id);
  }

  function dropBlock(id: string, point: Point) {
    for (const sid of SECTION_IDS) {
      const el = sectionRefs.current[sid];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom) {
        if (sectionOf(id) !== sid) {
          setBuckets((prev) => {
            const next = { ...prev, [id]: sid };
            try {
              window.localStorage.setItem(BUCKET_KEY, JSON.stringify(next));
            } catch {}
            return next;
          });
          setSquash(sid);
        }
        return;
      }
    }
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

  function header(id: SectionId, draggable: boolean) {
    return (
      <div className="relative mb-4 flex items-center gap-2">
        {draggable && (
          <span className="absolute -left-5 text-white/70 opacity-0 transition-opacity duration-150 group-hover:opacity-90">
            <GripDots />
          </span>
        )}
        <h2 className="font-display text-3xl font-semibold lowercase text-white drop-shadow-[0_1px_10px_rgba(60,70,150,0.45)]">
          {LABELS[id]}
        </h2>
        <button
          onClick={() => toggleBox(id)}
          className="glass-chip px-2 py-0.5 text-[10px] opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        >
          {boxed[id] ? "unbox" : "box"}
        </button>
      </div>
    );
  }

  function sectionBlocks(id: SectionId) {
    const blocks = allBlocks.filter((b) => sectionOf(b.id) === id);
    const inner = blocks.map((b) => (
      <BlockView key={b.id} block={b} boxed={true} onDrop={dropBlock} />
    ));
    return <div className="glass glass-deep flex flex-wrap gap-3 p-5">{inner}</div>;
  }

  if (!desktop) {
    return (
      <div className="mt-12 flex flex-col gap-14">
        {SECTION_IDS.map((id) => (
          <section key={id} className="group">
            {header(id, false)}
            {sectionBlocks(id)}
          </section>
        ))}
      </div>
    );
  }

  const boardHeight = Math.max(...Object.values(pos).map((p) => p.y)) + 340;

  return (
    <div className="relative mt-10" style={{ height: boardHeight }}>
      {SECTION_IDS.map((id) => (
        <motion.div
          key={id}
          ref={(el) => {
            sectionRefs.current[id] = el;
          }}
          drag
          dragMomentum={false}
          whileDrag={{ scale: 1.02, rotate: 0.4 }}
          animate={{ x: pos[id].x, y: pos[id].y }}
          transition={{ type: "spring", stiffness: 320, damping: 15, mass: 0.9 }}
          onDragEnd={(_, info) => dropSection(id, { x: info.offset.x, y: info.offset.y })}
          className={`group absolute cursor-grab active:cursor-grabbing ${SECTION_W}`}
          style={{ touchAction: "none" }}
        >
          <motion.div
            animate={
              squash === id
                ? { scaleY: [1, 0.94, 1.03, 1], scaleX: [1, 1.04, 0.99, 1] }
                : { scaleY: 1, scaleX: 1 }
            }
            transition={{ duration: 0.5, times: [0, 0.4, 0.72, 1], ease: "easeOut" }}
            onAnimationComplete={() => setSquash((s) => (s === id ? null : s))}
          >
            {header(id, true)}
            {sectionBlocks(id)}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
