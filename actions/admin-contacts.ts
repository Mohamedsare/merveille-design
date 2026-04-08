"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logAdminAuditEvent } from "@/lib/admin-audit";

const idSchema = z.object({ id: z.string().uuid() });

export async function deleteContactMessage(raw: unknown) {
  const parsed = idSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Identifiant invalide" };
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };

  const { id } = parsed.data;
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  await logAdminAuditEvent(supabase, "contact_message_delete", { contact_message_id: id });
  revalidatePath("/admin/dashboard/contacts");
  revalidatePath("/admin/dashboard/notifications");
  return { ok: true as const };
}
