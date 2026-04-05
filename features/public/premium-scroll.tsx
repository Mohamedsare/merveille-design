"use client";

import { motion, useScroll } from "framer-motion";

/**
 * Barre de progression de lecture + effets scroll (header, etc.) sans dépendance externe.
 */
export function PremiumScroll() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-[2px] origin-left bg-[var(--accent)]"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
