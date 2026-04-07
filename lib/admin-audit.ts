"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

type JsonLike = string | number | boolean | null | JsonLike[] | { [key: string]: JsonLike };

export async function logAdminAuditEvent(
  supabase: SupabaseClient,
  eventName: string,
  metadata: Record<string, JsonLike> = {},
  pagePath = "/admin/dashboard"
) {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return;

    await supabase.from("visitor_events").insert({
      event_name: `admin_${eventName}`,
      page_path: pagePath,
      session_id: user.id,
      metadata: {
        ...metadata,
        admin_id: user.id,
        admin_email: user.email ?? null,
      },
    });
  } catch {
    // Non bloquant : le journal d'audit ne doit jamais casser l'action admin.
  }
}

