"use client";

import { useCallback, useEffect, useRef } from "react";
import { trackVisitorEvent } from "@/actions/analytics";
import { getPosthogKey } from "@/lib/env";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("md_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("md_session", id);
  }
  return id;
}

function deviceType(): string {
  if (typeof window === "undefined") return "unknown";
  return window.matchMedia("(max-width: 768px)").matches ? "mobile" : "desktop";
}

export function usePageView(path: string) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    const run = async () => {
      if (getPosthogKey()) {
        const { default: posthog } = await import("posthog-js");
        posthog.capture("page_view", { path });
      }
      await trackVisitorEvent({
        event_name: "page_view",
        page_path: path,
        session_id: getSessionId(),
        device_type: deviceType(),
        browser: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      });
    };
    void run();
  }, [path]);
}

export function useTrackEvent() {
  return useCallback(async (name: string, props?: Record<string, unknown>) => {
    if (getPosthogKey()) {
      const { default: posthog } = await import("posthog-js");
      posthog.capture(name, props);
    }
    await trackVisitorEvent({
      event_name: name,
      page_path: typeof window !== "undefined" ? window.location.pathname : "/",
      session_id: getSessionId(),
      device_type: deviceType(),
      metadata: props,
    });
  }, []);
}
