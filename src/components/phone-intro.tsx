"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Nokia flip-phone loading screen.
 * The real dash renders inside the phone's screen hole at phone scale.
 * After 3s: web arms a scroll trigger, mobile takes over automatically -
 * the screen then zooms out to become the fullscreen dash.
 */

const VW = 390; // virtual dash viewport width inside the phone screen
const VH = 488; // virtual dash viewport height (matches screen-hole aspect)
const HOLE_W = 176;
const HOLE_H = 220;
const SCALE = HOLE_W / VW;

type Phase = "intro" | "zoom" | "done";

export function PhoneIntro({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [armed, setArmed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const reduce = useReducedMotion();
  const doneRef = useRef(false);

  const takeover = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase("zoom");
  }, []);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const setM = () => setIsMobile(mq.matches);
    setM();
    mq.addEventListener("change", setM);
    return () => mq.removeEventListener("change", setM);
  }, []);

  // 3s on screen: mobile auto-takes over, web arms the scroll trigger
  useEffect(() => {
    if (!mounted) return;
    const t = window.setTimeout(() => {
      if (reduce || isMobile) takeover();
      else setArmed(true);
    }, 3000);
    return () => window.clearTimeout(t);
  }, [mounted, isMobile, reduce, takeover]);

  // web: scroll (wheel / touch drag / page keys) triggers the zoom
  useEffect(() => {
    if (!armed || phase !== "intro") return;
    const onScroll = () => takeover();
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", " "].includes(e.key)) takeover();
    };
    window.addEventListener("wheel", onScroll, { passive: true });
    window.addEventListener("touchmove", onScroll, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("touchmove", onScroll);
      window.removeEventListener("keydown", onKey);
    };
  }, [armed, phase, takeover]);

  // lock page scroll while the phone is up
  useEffect(() => {
    if (!mounted || phase === "done") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted, phase]);

  if (!mounted) return null;
  if (phase === "done") return <>{children}</>;

  const zooming = phase === "zoom";
  const winW = typeof window === "undefined" ? VW : window.innerWidth;
  const winH = typeof window === "undefined" ? VH : window.innerHeight;

  return (
    <div className="phone-intro-root">
      {/* the dash, small inside the phone screen, fullscreen after the zoom */}
      <motion.div
        className="phone-content"
        initial={false}
        animate={zooming ? { width: winW, height: winH } : { width: HOLE_W, height: HOLE_H }}
        transition={{ duration: 0.85, ease: [0.7, 0, 0.2, 1] }}
      >
        <motion.div
          className="phone-viewport"
          initial={false}
          animate={
            zooming ? { scale: 1, width: winW, height: winH } : { scale: SCALE, width: VW, height: VH }
          }
          transition={{ duration: 0.85, ease: [0.7, 0, 0.2, 1] }}
          onAnimationComplete={() => {
            if (zooming) setPhase("done");
          }}
        >
          <motion.div
            className="phone-stage"
            initial={false}
            animate={
              zooming
                ? { width: winW, height: winH, marginTop: 0 }
                : { width: VW, height: winH, marginTop: -(winH - VH) / 2 }
            }
            transition={{ duration: 0.85, ease: [0.7, 0, 0.2, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* the pixel flip phone, drawn around a transparent screen hole */}
      <motion.div
        className="phone-shell"
        aria-hidden
        initial={false}
        animate={zooming ? { scale: 5, opacity: 0 } : { scale: 1, opacity: 1 }}
        transition={{ duration: 0.85, ease: [0.7, 0, 0.2, 1] }}
      >
        {/* lid around the screen hole */}
        <div className="phone-lid-top" />
        <div className="phone-lid-left" />
        <div className="phone-lid-right" />
        <div className="phone-lid-bottom" />
        <div className="phone-bezel" />
        <div className="phone-brand">NOKIA</div>
        <div className="phone-speaker" />
        {/* hinge */}
        <div className="phone-hinge">
          <span />
          <span />
        </div>
        {/* bottom half */}
        <div className="phone-bottom">
          <div className="phone-nav">
            <span className="phone-softkey" />
            <span className="phone-dpad">
              <i />
            </span>
            <span className="phone-softkey" />
          </div>
          <div className="phone-keys">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((k) => (
              <span key={k} className="phone-key">
                {k}
              </span>
            ))}
          </div>
          <div className="phone-mic" />
        </div>
      </motion.div>

      {!zooming && <div className="phone-hint">{armed ? "scroll to open" : "loading…"}</div>}
    </div>
  );
}
