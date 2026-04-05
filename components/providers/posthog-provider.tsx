"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import { getPosthogHost, getPosthogKey } from "@/lib/env";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = getPosthogKey();
    if (!key || typeof window === "undefined") return;
    posthog.init(key, {
      api_host: getPosthogHost(),
      person_profiles: "identified_only",
      capture_pageview: false,
    });
  }, []);

  const key = getPosthogKey();
  if (!key) return <>{children}</>;

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
