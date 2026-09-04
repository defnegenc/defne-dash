"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

export type StagePr = {
  number: number;
  label: string;
  author: string;
  state: "merged" | "ready" | "stale";
  url: string;
};
export type StageCuriosity = { slug: string; question: string; tagline: string };
export type StageCard =
  | {
      kind: "news";
      id: string;
      title: string;
      source: string;
      url: string;
      date: string;
      detail?: string;
      itemKind: string;
    }
  | { kind: "prs"; id: string; prs: StagePr[]; url: string }
  | { kind: "hw"; id: string; curiosities: StageCuriosity[]; url: string };

const PR_WORD: Record<StagePr["state"], { mark: string; word: string; cls: string }> = {
  ready: { mark: "↗", word: "ready to merge", cls: "pr-ready" },
  stale: { mark: "!", word: "stale", cls: "pr-stale" },
  merged: { mark: "✓", word: "merged", cls: "pr-merged" },
};

function Chevron({ dir }: { dir: "l" | "r" }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d={dir === "l" ? "M9 2.5 4.5 7 9 11.5" : "M5 2.5 9.5 7 5 11.5"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 16.5S3.5 12.6 2.3 8.9C1.3 6 3.3 3.5 6 3.5c1.7 0 3 .9 4 2.4 1-1.5 2.3-2.4 4-2.4 2.7 0 4.7 2.5 3.7 5.4-1.2 3.7-7.7 7.6-7.7 7.6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BranchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="5.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="5.5" cy="15.5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 6.5v7M14.5 8.5c0 3.5-4.5 3-6.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M10 2.5 11.8 8 17.5 10 11.8 12 10 17.5 8.2 12 2.5 10 8.2 8 10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FAVS = [
  { href: "https://learningetal.com", label: "learning et al.", icon: <HeartIcon /> },
  { href: "https://github.com/defnegenc/learning-et-al/pulls", label: "your prs", icon: <BranchIcon /> },
  { href: "/curiosities", label: "curiosities", icon: <SparkIcon /> },
];

function glyphFor(itemKind: string): string {
  if (itemKind === "ai-daily") return "✦";
  if (itemKind === "topic") return "μ";
  return "⌁";
}

function NewsCardBody({ card }: { card: Extract<StageCard, { kind: "news" }> }) {
  return (
    <>
      <div className="card-visual">
        <span className="card-visual-glyph">{glyphFor(card.itemKind)}</span>
        <span className="vchip absolute left-4 top-4">{card.source}</span>
        <a href={card.url} className="vchip vchip-strong absolute right-4 top-4">
          open ↗
        </a>
      </div>
      <div className="vglass-panel flex-1 px-6 pb-5 pt-4">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="text-[17px] font-semibold leading-snug text-white [text-shadow:0_1px_8px_rgba(8,12,48,0.55)]">
            {card.title}
          </h3>
          <span className="shrink-0 text-[13px] text-white/80">{card.date}</span>
        </div>
        {card.detail && (
          <p className="mt-2 text-[14px] leading-snug text-white/85 [text-shadow:0_1px_6px_rgba(8,12,48,0.5)]">
            {card.detail}
          </p>
        )}
        <p className="mt-2.5 text-[12px] tracking-wide text-white/60">
          {card.source} · {card.itemKind === "ai-daily" ? "pinned daily" : "from your week"}
        </p>
      </div>
    </>
  );
}

function PrCardBody({ card }: { card: Extract<StageCard, { kind: "prs" }> }) {
  return (
    <>
      <div className="card-visual">
        <span className="card-visual-glyph">⑃</span>
        <span className="vchip absolute left-4 top-4">learning-et-al</span>
        <a href={card.url} className="vchip vchip-strong absolute right-4 top-4">
          all prs ↗
        </a>
      </div>
      <div className="vglass-panel flex-1 overflow-y-auto px-5 pb-5 pt-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[17px] font-semibold text-white [text-shadow:0_1px_8px_rgba(8,12,48,0.55)]">
            pr pile
          </h3>
          <span className="text-[13px] text-white/80">{card.prs.length} open</span>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {card.prs.map((pr) => {
            const st = PR_WORD[pr.state];
            return (
              <li key={pr.number}>
                <a href={pr.url} className={`pr-row ${st.cls}`}>
                  <span className="pr-mark">{st.mark}</span>
                  <span className="font-semibold">PR {pr.number}</span>
                  <span className="truncate">{pr.label}</span>
                  <span className="ml-auto shrink-0 text-[12px] opacity-80">
                    {pr.author === "agent" ? "agent" : "you"} · {st.word}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}

function HwCardBody({ card }: { card: Extract<StageCard, { kind: "hw" }> }) {
  return (
    <>
      <div className="card-visual">
        <span className="card-visual-glyph">✦</span>
        <span className="vchip absolute left-4 top-4">homework</span>
        <a href={card.url} className="vchip vchip-strong absolute right-4 top-4">
          all ↗
        </a>
      </div>
      <div className="vglass-panel flex-1 overflow-y-auto px-5 pb-5 pt-4">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[17px] font-semibold text-white [text-shadow:0_1px_8px_rgba(8,12,48,0.55)]">
            curiosity homework
          </h3>
          <span className="text-[13px] text-white/80">{card.curiosities.length} questions</span>
        </div>
        <ul className="mt-3 flex flex-col gap-2">
          {card.curiosities.map((c) => (
            <li key={c.slug}>
              <a href={`/curiosities/${c.slug}`} className="pr-row pr-ready">
                <span className="pr-mark">→</span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{c.question}</span>
                  <span className="block truncate text-[12px] font-normal opacity-80">
                    {c.tagline}
                  </span>
                </span>
                <span className="ml-auto shrink-0 text-[12px] opacity-80">researched ✓</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function Stage({
  cards,
  summary,
  date,
}: {
  cards: StageCard[];
  summary: string;
  date: string;
}) {
  const [i, setI] = useState(0);
  const [squash, setSquash] = useState(false);
  const [wide, setWide] = useState(true);
  const n = cards.length;
  const go = (d: number) => {
    setI((v) => (v + d + n) % n);
    setSquash(true);
  };

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const up = () => setWide(mq.matches);
    up();
    mq.addEventListener("change", up);
    return () => mq.removeEventListener("change", up);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const current = cards[i];
  const currentUrl = current.kind === "news" ? current.url : current.url;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-24">
      {/* top bar: summary */}
      <header className="vglass-bar vglass-pill fixed left-1/2 top-4 z-40 flex w-[min(940px,94vw)] -translate-x-1/2 items-center gap-3 px-5 py-2.5">
        <span className="font-display shrink-0 text-[17px] font-semibold tracking-tight">
          defne dash
        </span>
        <span className="vglass-well min-w-0 flex-1 truncate px-4 py-1.5 text-center text-[13px] text-white/90">
          {summary}
        </span>
        <span className="shrink-0 text-[13px] font-medium opacity-80">{date}</span>
      </header>

      {/* left bar: favourites (desktop) */}
      <nav className="vglass-bar vglass-pill fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-1.5 px-2 py-3 md:flex">
        {FAVS.map((f) => (
          <a key={f.href} href={f.href} title={f.label} aria-label={f.label} className="vbtn">
            {f.icon}
          </a>
        ))}
      </nav>
      {/* favourites, mobile: horizontal under top bar */}
      <nav className="vglass-bar vglass-pill fixed left-1/2 top-[68px] z-40 flex -translate-x-1/2 items-center gap-1.5 px-2 py-1.5 md:hidden">
        {FAVS.map((f) => (
          <a key={f.href} href={f.href} title={f.label} aria-label={f.label} className="vbtn">
            {f.icon}
          </a>
        ))}
      </nav>

      {/* card carousel */}
      <div
        className="relative flex w-full max-w-[1120px] items-center justify-center"
        style={{ perspective: 1500, height: "min(66vh, 560px)", minHeight: 420 }}
      >
        {cards.map((card, idx) => {
          let off = idx - i;
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
          if (Math.abs(off) > 1) return null;
          const center = off === 0;
          return (
            <motion.div
              key={card.id}
              className="absolute"
              style={{
                width: "min(560px, 88vw)",
                height: "100%",
                transformPerspective: 1500,
                zIndex: center ? 30 : 20,
                pointerEvents: center ? "auto" : "none",
              }}
              animate={{
                x: `${off * (wide ? 66 : 82)}%`,
                scale: center ? 1 : 0.82,
                rotateY: off * -14,
                opacity: center ? 1 : wide ? 0.7 : 0.45,
              }}
              transition={{ type: "spring", stiffness: 240, damping: 26, mass: 1 }}
              drag={center ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              dragMomentum={false}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) go(1);
                else if (info.offset.x > 70) go(-1);
              }}
            >
              <motion.div
                className="vglass vglass-card flex h-full flex-col overflow-hidden"
                animate={
                  squash && center
                    ? { scaleY: [1, 0.95, 1.025, 1], scaleX: [1, 1.035, 0.99, 1] }
                    : { scaleY: 1, scaleX: 1 }
                }
                transition={{ duration: 0.45, times: [0, 0.4, 0.72, 1], ease: "easeOut" }}
                onAnimationComplete={() => center && setSquash(false)}
              >
                {card.kind === "news" && <NewsCardBody card={card} />}
                {card.kind === "prs" && <PrCardBody card={card} />}
                {card.kind === "hw" && <HwCardBody card={card} />}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* bottom bar: interact */}
      <footer className="vglass-bar vglass-pill fixed bottom-5 left-1/2 z-40 flex w-[min(560px,92vw)] -translate-x-1/2 items-center gap-2 px-3 py-2">
        <button onClick={() => go(-1)} aria-label="previous card" className="vbtn">
          <Chevron dir="l" />
        </button>
        <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
          <span className="truncate text-[13px] font-medium opacity-90">
            {i + 1} / {n}
            {" · "}
            {current.kind === "news"
              ? current.source
              : current.kind === "prs"
                ? "pr pile"
                : "curiosity homework"}
          </span>
          <span className="flex items-center gap-1.5">
            {cards.map((c, d) => (
              <button
                key={c.id}
                aria-label={`card ${d + 1}`}
                onClick={() => {
                  setI(d);
                  setSquash(true);
                }}
                className={`h-[5px] rounded-full transition-all ${
                  d === i ? "w-5 dot dot-active" : "w-[5px] dot hover:opacity-70"
                }`}
              />
            ))}
          </span>
        </div>
        <a href={currentUrl} aria-label="open current" className="vbtn">
          ↗
        </a>
        <button onClick={() => go(1)} aria-label="next card" className="vbtn">
          <Chevron dir="r" />
        </button>
      </footer>
    </main>
  );
}
