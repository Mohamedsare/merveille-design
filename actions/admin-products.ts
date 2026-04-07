"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { runSharpEnhancementForProductImage } from "@/services/imageEnhancementService";
import { productAdminSchema } from "@/validation/schemas";

export type UpsertProductResult =
  | { ok: true; id: string }
  | { ok: false; error: string; fields?: Record<string, unknown> };

export async function upsertProduct(id: string | null, raw: unknown): Promise<UpsertProductResult> {
  const parsed = productAdminSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false as const, error: "Validation", fields: parsed.error.flatten() as Record<string, unknown> };
  }
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
    revalidatePath("/");
    revalidatePath("/admin/dashboard/products");
    return { ok: true as const, id };
  }

  const { data, error } = await supabase.from("products").insert(payload).select("id").single();
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/dashboard/products");
  return { ok: true as const, id: data.id };
}

export async function addProductImage(
  productId: string,
  imageUrl: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const url = imageUrl.trim();
  if (!url) return { ok: false as const, error: "URL vide" };
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };

  const { data: last } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (last?.sort_order ?? -1) + 1;
  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    image_url: url,
    sort_order: nextOrder,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/dashboard/products");
  revalidatePath("/admin/dashboard/media");
  return { ok: true as const };
}

export async function deleteProductImage(
  imageId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/dashboard/products");
  revalidatePath("/admin/dashboard/media");
  return { ok: true as const };
}

export async function moveProductImage(
  productId: string,
  imageId: string,
  direction: "up" | "down"
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };

  const { data: rows, error } = await supabase
    .from("product_images")
    .select("id, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) return { ok: false as const, error: error.message };
  if (!rows?.length) return { ok: false as const, error: "Galerie vide" };

  const currentIndex = rows.findIndex((r) => r.id === imageId);
  if (currentIndex < 0) return { ok: false as const, error: "Image introuvable" };

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= rows.length) return { ok: true as const };

  const current = rows[currentIndex];
  const target = rows[targetIndex];

  const { error: firstErr } = await supabase
    .from("product_images")
    .update({ sort_order: target.sort_order })
    .eq("id", current.id);
  if (firstErr) return { ok: false as const, error: firstErr.message };

  const { error: secondErr } = await supabase
    .from("product_images")
    .update({ sort_order: current.sort_order })
    .eq("id", target.id);
  if (secondErr) return { ok: false as const, error: secondErr.message };

  revalidatePath("/");
  revalidatePath("/admin/dashboard/products");
  revalidatePath("/admin/dashboard/media");
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

export async function requestAllImageEnhancements() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };

  const { data: rows, error } = await supabase
    .from("product_images")
    .select("id, image_url, enhancement_status")
    .neq("enhancement_status", "approved")
    .order("created_at", { ascending: false });

  if (error) return { ok: false as const, error: error.message };
  if (!rows?.length) return { ok: true as const, processed: 0, failed: 0 };

  let processed = 0;
  let failed = 0;

  for (const row of rows) {
    if (!row.image_url) {
      failed += 1;
      continue;
    }
    await supabase.from("product_images").update({ enhancement_status: "pending" }).eq("id", row.id);
    const res = await runSharpEnhancementForProductImage(supabase, row.id, row.image_url);
    if (res.ok) processed += 1;
    else failed += 1;
  }

  revalidatePath("/");
  revalidatePath("/admin/dashboard/media");
  return { ok: true as const, processed, failed };
}
