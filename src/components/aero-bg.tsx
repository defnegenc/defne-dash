"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

/**
 * Living dithered-sky background. CSS owns the autonomous cloud drift;
 * motion.dev owns pointer parallax at two depths. Transform (parallax)
 * and translate (CSS keyframes) compose, so nothing fights.
 */
export function AeroBg() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 36, damping: 13, mass: 1.2 });
  const sy = useSpring(my, { stiffness: 36, damping: 13, mass: 1.2 });

  const slowX = useTransform(sx, (v) => v * -20);
  const slowY = useTransform(sy, (v) => v * -14);
  const midX = useTransform(sx, (v) => v * 38);
  const midY = useTransform(sy, (v) => v * 26);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  return (
    <>
      <motion.div aria-hidden className="aero-clouds aero-clouds-far" style={{ x: slowX, y: slowY }} />
      <motion.div aria-hidden className="aero-clouds aero-clouds-near" style={{ x: midX, y: midY }} />
      <motion.div aria-hidden className="aero-bloom" style={{ x: slowX, y: slowY }} />
    </>
  );
}
