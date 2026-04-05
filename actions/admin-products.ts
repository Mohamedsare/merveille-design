"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { runSharpEnhancementForProductImage } from "@/services/imageEnhancementService";
import { productAdminSchema } from "@/validation/schemas";

export async function upsertProduct(id: string | null, raw: unknown) {
  const parsed = productAdminSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Validation", fields: parsed.error.flatten() };
  const v = parsed.data;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };

  const payload = {
    name: v.name,
    slug: v.slug,
    category_id: v.category_id,
    type: v.type,
    short_description: v.short_description || null,
    description: v.description || null,
    base_price: v.base_price,
    pricing_mode: v.pricing_mode,
    is_customizable: v.is_customizable,
    is_model_only: v.is_model_only,
    is_featured: v.is_featured,
    is_published: v.is_published,
    cover_image_url: v.cover_image_url || null,
    tags: v.tags ?? [],
    display_order: v.display_order,
    stock: v.stock,
  };

  if (id) {
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if (error) return { ok: false as const, error: error.message };
  } else {
    const { error } = await supabase.from("products").insert(payload);
    if (error) return { ok: false as const, error: error.message };
  }
  revalidatePath("/");
  revalidatePath("/admin/dashboard/products");
  return { ok: true as const };
}

export async function deleteProduct(id: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/dashboard/products");
  return { ok: true as const };
}

export async function requestImageEnhancement(productImageId: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };
  const { data: row } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("id", productImageId)
    .maybeSingle();
  if (!row?.image_url) return { ok: false as const, error: "Image introuvable" };

  await supabase
    .from("product_images")
    .update({ enhancement_status: "pending" })
    .eq("id", productImageId);

  await runSharpEnhancementForProductImage(supabase, productImageId, row.image_url);

  revalidatePath("/admin/dashboard/media");
  return { ok: true as const };
}
