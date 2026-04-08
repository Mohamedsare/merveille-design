"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logAdminAuditEvent } from "@/lib/admin-audit";

const KEY = "lifestyle_gallery_urls";

const schema = z.object({
  settingsId: z.string().uuid(),
  urls: z.array(z.string()),
});

export async function saveLifestyleGallery(raw: unknown) {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Données invalides" };

  const cleaned = parsed.data.urls.map((s) => s.trim()).filter(Boolean);
  for (const u of cleaned) {
    try {
      new URL(u);
    } catch {
      return { ok: false as const, error: `URL invalide : ${u.slice(0, 48)}…` };
    }
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };

  const { data: current } = await supabase.from("site_settings").select("theme_config").eq("id", parsed.data.settingsId).maybeSingle();
  const currentTheme = ((current?.theme_config as Record<string, unknown> | null) ?? {}) as Record<string, unknown>;
  const nextTheme: Record<string, unknown> = { ...currentTheme, [KEY]: cleaned };

  const { error } = await supabase
    .from("site_settings")
    .update({ theme_config: nextTheme })
    .eq("id", parsed.data.settingsId);
  if (error) return { ok: false as const, error: error.message };

  await logAdminAuditEvent(supabase, "lifestyle_gallery_update", { count: cleaned.length }, "/admin/dashboard/lifestyle-gallery");
  revalidatePath("/");
  revalidatePath("/admin/dashboard/lifestyle-gallery");
  return { ok: true as const };
}
