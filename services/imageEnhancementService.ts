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

export type EnhancementMode = "quick" | "ai";
type SharpPipeline = typeof SHARP_PIPELINE;

/** Paramètres subtils — ne pas dénaturer le produit */
const SHARP_PIPELINE = {
  linear: 1.02,
  modulate: { brightness: 1.03, saturation: 1.04 } as const,
  sharpen: { sigma: 0.35, m1: 0.5, m2: 0.15 } as const,
  normalize: true as const,
};

export async function enhanceBufferSubtle(input: Buffer): Promise<Buffer> {
  return enhanceBufferWithPipeline(input, SHARP_PIPELINE);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sanitizePipeline(input: Partial<SharpPipeline>): Partial<SharpPipeline> {
  const out: Partial<SharpPipeline> = {};
  if (typeof input.linear === "number") out.linear = clamp(input.linear, 0.92, 1.18);
  if (input.modulate) {
    out.modulate = {
      brightness: clamp(input.modulate.brightness ?? SHARP_PIPELINE.modulate.brightness, 0.9, 1.2),
      saturation: clamp(input.modulate.saturation ?? SHARP_PIPELINE.modulate.saturation, 0.85, 1.25),
    };
  }
  if (input.sharpen) {
    out.sharpen = {
      sigma: clamp(input.sharpen.sigma ?? SHARP_PIPELINE.sharpen.sigma, 0.2, 1.2),
      m1: clamp(input.sharpen.m1 ?? SHARP_PIPELINE.sharpen.m1, 0, 2),
      m2: clamp(input.sharpen.m2 ?? SHARP_PIPELINE.sharpen.m2, 0, 2),
    };
  }
  if (typeof input.normalize === "boolean") out.normalize = input.normalize;
  return out;
}

async function enhanceBufferWithPipeline(input: Buffer, overrides?: Partial<SharpPipeline>): Promise<Buffer> {
  const merged: SharpPipeline = {
    ...SHARP_PIPELINE,
    ...overrides,
    modulate: { ...SHARP_PIPELINE.modulate, ...(overrides?.modulate ?? {}) },
    sharpen: { ...SHARP_PIPELINE.sharpen, ...(overrides?.sharpen ?? {}) },
  };

  let pipeline = sharp(input).rotate();
  if (merged.normalize) {
    pipeline = pipeline.normalize();
  }
  return pipeline
    .linear(merged.linear, 0)
    .modulate(merged.modulate)
    .sharpen(merged.sharpen)
    .jpeg({ quality: 92, mozjpeg: true })
    .toBuffer();
}

/**
 * Télécharge l'image source, applique le pipeline, upload dans `media/enhanced/`.
 */
export async function runSharpEnhancementForProductImage(
  supabase: SupabaseClient,
  productImageId: string,
  sourceUrl: string,
  mode: EnhancementMode = "quick"
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
    const aiOverrides = mode === "ai" ? await orchestrateWithDeepSeek(sourceUrl) : null;
    const enhanced = await enhanceBufferWithPipeline(buf, aiOverrides ? sanitizePipeline(aiOverrides) : undefined);
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
  try {
    const resp = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content:
              "Tu ajustes des presets photo e-commerce sacs. Reponds uniquement en JSON avec: linear, brightness, saturation, sharpen_sigma, sharpen_m1, sharpen_m2, normalize.",
          },
          {
            role: "user",
            content:
              "Propose un preset subtil mais premium pour un sac artisanal en photo produit. Evite tout rendu artificiel. JSON seulement.",
          },
        ],
      }),
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;
    const clean = content.replace(/^```json\s*/i, "").replace(/^```/i, "").replace(/```$/, "").trim();
    const parsed = JSON.parse(clean) as Record<string, unknown>;
    return {
      linear: typeof parsed.linear === "number" ? parsed.linear : undefined,
      normalize: typeof parsed.normalize === "boolean" ? parsed.normalize : undefined,
      modulate: {
        brightness: typeof parsed.brightness === "number" ? parsed.brightness : undefined,
        saturation: typeof parsed.saturation === "number" ? parsed.saturation : undefined,
      },
      sharpen: {
        sigma: typeof parsed.sharpen_sigma === "number" ? parsed.sharpen_sigma : undefined,
        m1: typeof parsed.sharpen_m1 === "number" ? parsed.sharpen_m1 : undefined,
        m2: typeof parsed.sharpen_m2 === "number" ? parsed.sharpen_m2 : undefined,
      },
    };
  } catch {
    return null;
  }
}
