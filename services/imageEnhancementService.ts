/**
 * Pipeline d'amélioration d'image — sobre et commercial.
 * Abstraction extensible : ajouter un provider DeepSeek / API vision plus tard.
 */

import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";

export type EnhancementProviderId = "sharp_subtle" | "deepseek_orchestrated";

export interface ImageEnhancementResult {
  ok: boolean;
  enhancedPublicUrl?: string;
  error?: string;
}

/** Paramètres subtils — ne pas dénaturer le produit */
const SHARP_PIPELINE = {
  linear: 1.02,
  modulate: { brightness: 1.03, saturation: 1.04 } as const,
  sharpen: { sigma: 0.35, m1: 0.5, m2: 0.15 } as const,
  normalize: true as const,
};

export async function enhanceBufferSubtle(input: Buffer): Promise<Buffer> {
  let pipeline = sharp(input).rotate();
  if (SHARP_PIPELINE.normalize) {
    pipeline = pipeline.normalize();
  }
  return pipeline
    .linear(SHARP_PIPELINE.linear, 0)
    .modulate(SHARP_PIPELINE.modulate)
    .sharpen(SHARP_PIPELINE.sharpen)
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();
}

/**
 * Télécharge l'image source, applique le pipeline, upload dans `media/enhanced/`.
 */
export async function runSharpEnhancementForProductImage(
  supabase: SupabaseClient,
  productImageId: string,
  sourceUrl: string
): Promise<ImageEnhancementResult> {
  try {
    await supabase
      .from("product_images")
      .update({ enhancement_status: "processing" })
      .eq("id", productImageId);

    const res = await fetch(sourceUrl);
    if (!res.ok) {
      await supabase
        .from("product_images")
        .update({ enhancement_status: "error" })
        .eq("id", productImageId);
      return { ok: false, error: `Téléchargement impossible (${res.status})` };
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const enhanced = await enhanceBufferSubtle(buf);
    const path = `enhanced/${productImageId}.jpg`;

    const { error: upErr } = await supabase.storage.from("media").upload(path, enhanced, {
      contentType: "image/jpeg",
      upsert: true,
    });

    if (upErr) {
      await supabase
        .from("product_images")
        .update({ enhancement_status: "error" })
        .eq("id", productImageId);
      return { ok: false, error: upErr.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(path);

    await supabase
      .from("product_images")
      .update({
        enhanced_image_url: publicUrl,
        // Auto-application: une amélioration réussie devient immédiatement exploitable côté public.
        enhancement_status: "approved",
        original_image_url: sourceUrl,
      })
      .eq("id", productImageId);

    return { ok: true, enhancedPublicUrl: publicUrl };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erreur inconnue";
    await supabase
      .from("product_images")
      .update({ enhancement_status: "error" })
      .eq("id", productImageId);
    return { ok: false, error: msg };
  }
}

/**
 * Point d'extension DeepSeek : analyser l'image ou piloter des presets (placeholder).
 */
export async function orchestrateWithDeepSeek(_imageUrl: string): Promise<Partial<typeof SHARP_PIPELINE> | null> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return null;
  /* Appel texte optionnel pour suggestions de paramètres — sans génération d'image */
  return null;
}
