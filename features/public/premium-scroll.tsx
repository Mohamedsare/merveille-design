"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect } from "react";

const spring = { stiffness: 95, damping: 30, mass: 0.32 } as const;

/**
 * Progression de lecture + halo : effet scroll premium (sans lib externe).
 * Expose `--scroll-progress` sur `<html>` pour d’éventuels styles globaux.
 */
export function PremiumScroll() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, spring);
  const highlightLeft = useTransform(smooth, [0, 1], ["-20%", "120%"]);

  useMotionValueEvent(smooth, "change", (latest) => {
    document.documentElement.style.setProperty("--scroll-progress", String(latest));
  });

  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty("--scroll-progress");
    };
  }, []);

  if (reduceMotion) {
    return (
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-[var(--primary)]"
        style={{ scaleX: scrollYProgress }}
      />
    );
  }

  return (
    <>
      {/* Halo doux sous la barre */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[4px] origin-left opacity-75 blur-[6px]"
        style={{
          scaleX: smooth,
          background:
            "linear-gradient(90deg, color-mix(in oklab, var(--primary) 70%, transparent), var(--accent), color-mix(in oklab, var(--primary) 70%, transparent))",
          willChange: "transform",
        }}
      />
      {/* Barre principale */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[61] h-[2px] origin-left shadow-[0_0_14px_rgba(196,165,116,0.5)]"
        style={{
          scaleX: smooth,
          background: "linear-gradient(90deg, var(--primary), var(--accent), var(--primary))",
          willChange: "transform",
        }}
      />
      {/* Reflet qui glisse le long de la progression */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed top-0 z-[62] h-[2px] w-[min(22vw,168px)] rounded-full bg-gradient-to-r from-transparent via-white to-transparent opacity-95 mix-blend-overlay"
        style={{ left: highlightLeft, willChange: "left" }}
      />
      {/* Rail vertical discret (desktop) */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed right-0 top-0 z-[59] hidden h-full w-px origin-top sm:block"
        style={{
          scaleY: smooth,
          transformOrigin: "top",
          background:
            "linear-gradient(to bottom, var(--accent) 0%, color-mix(in oklab, var(--primary) 35%, transparent) 28%, transparent 72%)",
          boxShadow: "-1px 0 12px color-mix(in oklab, var(--accent) 40%, transparent)",
          willChange: "transform",
        }}
      />
    </>
  );
}
