"use client";

import { useEffect, useRef } from "react";
import { useTrackEvent } from "@/hooks/use-analytics";

export function ScrollDepthTracker() {
  const track = useTrackEvent();
  const sent = useRef({ 25: false, 50: false, 75: false, 100: false });

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const total = doc.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      const pct = Math.round((window.scrollY / total) * 100);
      ([25, 50, 75, 100] as const).forEach((n) => {
        if (pct >= n && !sent.current[n]) {
          sent.current[n] = true;
          void track("scroll_depth", { depth: n });
        }
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [track]);

  return null;
}
