"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";

/* Folder unravel prototype: an old XP-style folder centered on the page.
   Click: the front flips down (hinged at its bottom edge), then the stack of
   sheets inside unravels - each sheet hinged at the far edge of the last, so
   the hinges alternate ends, each flip quicker than the one before, ending as
   one long strip of blank pages. Sheets are nested in 3D so every flip lands
   exactly where the strip currently ends. */

const SHEETS = 5; // sheets inside the folder, after the cover
const DURATIONS = [0.9, 0.7, 0.55, 0.42, 0.32, 0.26]; // cover, then sheets: a beat, then shorter and shorter

export function FolderUnravel() {
  const [open, setOpen] = useState(false);
  const running = useRef(false);
  const els = useRef<(HTMLDivElement | null)[]>([]);
  const stageRef = useRef<HTMLDivElement | null>(null);

  function scrollToSegment(i: number) {
    const stage = stageRef.current;
    if (!stage) return;
    const segH = stage.getBoundingClientRect().width * 0.62;
    const stageTop = stage.getBoundingClientRect().top + window.scrollY;
    const target = stageTop + (i + 1) * segH - window.innerHeight * 0.62;
    window.scrollTo({ top: Math.max(0, target), behavior: "auto" });
  }

  async function run() {
    if (running.current) return;
    running.current = true;
    setOpen(true);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    for (let i = 0; i <= SHEETS; i++) {
      const el = els.current[i];
      if (!el) continue;
      el.style.visibility = "visible";
      const from = i === 0 ? 0 : 180;
      const to = i === 0 ? 180 : 0;
      const anim = animate(
        el,
        { rotateX: [from, to] },
        reduced
          ? { duration: 0 }
          : { duration: DURATIONS[i], ease: i === 0 ? [0.62, 0, 0.72, 0.32] : [0.42, 0, 0.58, 0.38] },
      );
      if (reduced) {
        scrollToSegment(i);
      } else {
        const follow = window.setInterval(() => scrollToSegment(i), 40);
        await anim;
        window.clearInterval(follow);
        scrollToSegment(i);
      }
    }
  }

  // frame-capture hook: /folder?stage=k opens k flips instantly; &mid=1 holds the k-th flip half-open
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (!p.has("stage")) return;
    const k = Math.max(0, Math.min(Number(p.get("stage")) || 0, SHEETS + 1));
    running.current = true;
    setOpen(true);
    for (let i = 0; i <= SHEETS; i++) {
      const el = els.current[i];
      if (!el) continue;
      if (i < k) {
        el.style.visibility = "visible";
        el.style.transform = `rotateX(${i === 0 ? 180 : 0}deg)`;
      } else if (i === k && p.has("mid")) {
        el.style.visibility = "visible";
        el.style.transform = "rotateX(115deg)";
      }
    }
    scrollToSegment(Math.min(k, SHEETS));
  }, []);

  // nested sheets: each hinged at the free end of the one before
  function sheet(i: number): React.ReactNode {
    const isCover = i === 0;
    return (
      <div
        ref={(el) => {
          els.current[i] = el;
        }}
        className={isCover ? "folder-cover" : "folder-sheet"}
        style={{
          visibility: isCover ? "visible" : "hidden",
          transform: isCover ? undefined : "rotateX(180deg)",
        }}
      >
        {i < SHEETS ? sheet(i + 1) : null}
      </div>
    );
  }

  return (
    <main className="folder-page" onClick={run} role="button" aria-label="Open the folder" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") run(); }}>
      <div className="folder-stage" ref={stageRef}>
        <div className="folder-back">
          <span className="folder-tab" aria-hidden />
        </div>
        {sheet(0)}
      </div>
      <p className="folder-hint">{open ? "" : "click the folder"}</p>
    </main>
  );
}
