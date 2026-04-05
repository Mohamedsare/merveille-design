"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  contactQuickSchema,
  orderProductSchema,
  orderTrainingSchema,
} from "@/validation/schemas";

export async function submitProductOrder(raw: unknown) {
  const parsed = orderProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "Données invalides", fields: parsed.error.flatten() };
  }
  const v = parsed.data;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Supabase non configuré" };

  const row = {
    customer_name: v.customer_name,
    phone: v.phone,
    email: v.email || null,
    city: v.city || null,
    country: v.country || "Burkina Faso",
    order_type: v.order_type,
    product_id: v.product_id || null,
    training_id: null,
    quantity: v.quantity,
    budget: v.budget || null,
    customization_request: v.customization_request || null,
    details: v.details,
    fabric_color_notes: v.fabric_color_notes || null,
    inspiration_image_url: v.inspiration_image_url || null,
    preferred_date: v.preferred_date || null,
    status: "new",
  };

  const { error } = await supabase.from("orders").insert(row);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/dashboard/orders");
  return { ok: true as const };
}

export async function submitTrainingBooking(raw: unknown) {
  const parsed = orderTrainingSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "Données invalides", fields: parsed.error.flatten() };
  }
  const v = parsed.data;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Supabase non configuré" };

  const row = {
    customer_name: v.customer_name,
    phone: v.phone,
    email: v.email || null,
    city: v.city || null,
    country: v.country || "Burkina Faso",
    order_type: "training" as const,
    product_id: null,
    training_id: v.training_id || null,
    quantity: 1,
    details: v.details,
    customization_request: v.customization_request || null,
    status: "training_received",
  };

  const { error } = await supabase.from("orders").insert(row);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/dashboard/orders");
  return { ok: true as const };
}

export async function submitQuickContact(raw: unknown) {
  const parsed = contactQuickSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "Champs incomplets" };
  }
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Supabase non configuré" };
  const { error } = await supabase.from("orders").insert({
    customer_name: parsed.data.name,
    phone: parsed.data.phone,
    order_type: "custom_bag",
    quantity: 1,
    details: parsed.data.message,
    status: "new",
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/admin/dashboard/orders");
  return { ok: true as const };
}
