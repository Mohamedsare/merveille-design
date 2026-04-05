"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createServiceSupabaseClient } from "@/lib/supabase/service";
import { safeImageExtension, validateImageFile } from "@/lib/media-upload";
import {
  contactQuickSchema,
  orderProductSchema,
  orderTrainingSchema,
} from "@/validation/schemas";

async function uploadOrderInspirationToStorage(
  file: File
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const valid = validateImageFile(file);
  if (!valid.ok) return valid;
  const supabase = createServiceSupabaseClient();
  if (!supabase) {
    return {
      ok: false,
      error:
        "Envoi de fichier indisponible. Ajoutez SUPABASE_SERVICE_ROLE_KEY côté serveur ou utilisez un lien vers la photo.",
    };
  }
  const ext = safeImageExtension(file.name, file.type);
  const path = `inspiration/${Date.now()}-${crypto.randomUUID().slice(0, 10)}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from("media").upload(path, buf, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return { ok: false, error: error.message };
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}

/** Formulaire commande produit (champs + fichier inspiration optionnel). */
export async function submitProductOrderForm(formData: FormData) {
  const file = formData.get("inspiration_image_file");
  let inspiration = String(formData.get("inspiration_image_url") ?? "").trim();

  if (file instanceof File && file.size > 0) {
    const up = await uploadOrderInspirationToStorage(file);
    if (!up.ok) return up;
    inspiration = up.url;
  }

  const raw = {
    customer_name: formData.get("customer_name"),
    phone: formData.get("phone"),
    email: formData.get("email") || "",
    city: formData.get("city") || "",
    country: formData.get("country") || "Burkina Faso",
    order_type: formData.get("order_type"),
    product_id: formData.get("product_id") || null,
    quantity: formData.get("quantity") || 1,
    budget: formData.get("budget") || "",
    customization_request: formData.get("customization_request") || "",
    details: formData.get("details"),
    fabric_color_notes: formData.get("fabric_color_notes") || "",
    inspiration_image_url: inspiration,
    preferred_date: formData.get("preferred_date") || "",
  };

  return submitProductOrder(raw);
}

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
