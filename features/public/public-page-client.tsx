"use client";

import { useEffect } from "react";
import { usePageView, useTrackEvent } from "@/hooks/use-analytics";
import { ScrollDepthTracker } from "@/features/public/scroll-depth-tracker";

export function PublicPageClient() {
  usePageView("/");
  const track = useTrackEvent();

  useEffect(() => {
    void track("session_start", {});
  }, [track]);

  return <ScrollDepthTracker />;
}
