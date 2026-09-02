"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";

/**
 * Living aero background. CSS owns the autonomous drift (spin, float);
 * motion.dev owns pointer parallax at three depths. Transform (parallax)
 * and translate/rotate (CSS keyframes) compose, so nothing fights.
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
  const fastX = useTransform(sx, (v) => v * 64);
  const fastY = useTransform(sy, (v) => v * 46);

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
      <motion.div aria-hidden className="aero-swirl" style={{ x: slowX, y: slowY }} />
      <motion.div aria-hidden className="aero-bloom" style={{ x: midX, y: midY }} />
      <motion.div aria-hidden className="aero-bubble one" style={{ x: fastX, y: fastY }} />
      <motion.div aria-hidden className="aero-bubble two" style={{ x: midX, y: midY }} />
      <motion.div aria-hidden className="aero-bubble three" style={{ x: slowX, y: slowY }} />
    </>
  );
}
