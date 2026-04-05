"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { visitorEventSchema } from "@/validation/schemas";

export async function trackVisitorEvent(raw: unknown) {
  const parsed = visitorEventSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const };
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const };
  const v = parsed.data;
  const { error } = await supabase.from("visitor_events").insert({
    event_name: v.event_name,
    page_path: v.page_path ?? "/",
    session_id: v.session_id ?? null,
    device_type: v.device_type ?? null,
    browser: v.browser ?? null,
    metadata: (v.metadata ?? {}) as Record<string, unknown>,
  });
  if (error) return { ok: false as const };
  return { ok: true as const };
}
