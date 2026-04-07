"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logAdminAuditEvent } from "@/lib/admin-audit";
import { trainingAdminSchema } from "@/validation/schemas";

export async function upsertTraining(id: string | null, raw: unknown) {
  const parsed = trainingAdminSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Validation", fields: parsed.error.flatten() };
  const v = parsed.data;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };

  const payload = {
    title: v.title,
    slug: v.slug,
    short_description: v.short_description || null,
    description: v.description || null,
    price: v.price,
    pricing_mode: v.pricing_mode,
    duration: v.duration || null,
    level: v.level || null,
    mode: v.mode || "presentiel",
    is_published: v.is_published,
    cover_image_url: v.cover_image_url || null,
    display_order: v.display_order,
  };

  if (id) {
    const { error } = await supabase.from("trainings").update(payload).eq("id", id);
    if (error) return { ok: false as const, error: error.message };
    await logAdminAuditEvent(supabase, "training_update", { training_id: id, title: payload.title });
  } else {
    const { data, error } = await supabase.from("trainings").insert(payload).select("id").single();
    if (error) return { ok: false as const, error: error.message };
    await logAdminAuditEvent(supabase, "training_create", { training_id: data.id, title: payload.title });
  }
  revalidatePath("/");
  revalidatePath("/admin/dashboard/trainings");
  return { ok: true as const };
}

export async function deleteTraining(id: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };
  const { error } = await supabase.from("trainings").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  await logAdminAuditEvent(supabase, "training_delete", { training_id: id });
  revalidatePath("/");
  revalidatePath("/admin/dashboard/trainings");
  return { ok: true as const };
}
