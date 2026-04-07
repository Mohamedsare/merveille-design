"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logAdminAuditEvent } from "@/lib/admin-audit";

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.string().min(1),
  admin_notes: z.string().optional(),
});

export async function updateOrderStatus(raw: unknown) {
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Invalide" };
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };

  const { id, status, admin_notes } = parsed.data;
  const { data: prev } = await supabase.from("orders").select("status").eq("id", id).single();

  const { error } = await supabase
    .from("orders")
    .update({ status, admin_notes: admin_notes ?? null })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("order_status_history").insert({
      order_id: id,
      from_status: prev?.status ?? null,
      to_status: status,
      created_by: user.id,
    });
  }
  await logAdminAuditEvent(supabase, "order_status_update", {
    order_id: id,
    from_status: prev?.status ?? null,
    to_status: status,
  });

  revalidatePath("/admin/dashboard/orders");
  return { ok: true as const };
}

export async function exportOrdersCsv(): Promise<{ csv: string } | { error: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { error: "Non configuré" };
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) return { error: error.message };
  await logAdminAuditEvent(supabase, "orders_export_csv", { rows: (data ?? []).length });
  const headers = [
    "id",
    "customer_name",
    "phone",
    "email",
    "order_type",
    "status",
    "created_at",
  ];
  const lines = [headers.join(",")];
  for (const row of data ?? []) {
    lines.push(
      headers
        .map((h) => {
          const v = (row as Record<string, unknown>)[h];
          const s = v == null ? "" : String(v).replaceAll('"', '""');
          return `"${s}"`;
        })
        .join(",")
    );
  }
  return { csv: lines.join("\n") };
}
