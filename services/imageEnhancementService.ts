/**
 * Pipeline d'amélioration d'image — sobre et commercial.
 * Abstraction extensible : provider IA optionnel pour ajuster les presets.
 */

import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";

export type EnhancementProviderId = "sharp_subtle" | "openai_orchestrated";

export interface ImageEnhancementResult {
  ok: boolean;
  enhancedPublicUrl?: string;
  error?: string;
}

export type EnhancementMode = "quick" | "ai";
type SharpModulate = {
  brightness: number;
  saturation: number;
};

type SharpSharpen = {
  sigma: number;
  m1: number;
  m2: number;
};

type SharpPipeline = {
  linear: number;
  modulate: SharpModulate;
  sharpen: SharpSharpen;
  normalize: boolean;
};

type SharpPipelineOverrides = {
  linear?: number;
  modulate?: Partial<SharpModulate>;
  sharpen?: Partial<SharpSharpen>;
  normalize?: boolean;
};

/** Paramètres subtils — ne pas dénaturer le produit */
const SHARP_PIPELINE = {
  linear: 1.02,
  modulate: { brightness: 1.03, saturation: 1.04 },
  sharpen: { sigma: 0.35, m1: 0.5, m2: 0.15 },
  normalize: true,
} satisfies SharpPipeline;

/** Garde-fou "fidélité produit" : version encore plus prudente. */
const CONSERVATIVE_PIPELINE: SharpPipeline = {
  linear: 1.01,
  modulate: { brightness: 1.01, saturation: 1.01 },
  sharpen: { sigma: 0.25, m1: 0.25, m2: 0.05 },
  normalize: false,
};

export async function enhanceBufferSubtle(input: Buffer): Promise<Buffer> {
  return enhanceBufferWithPipeline(input, SHARP_PIPELINE);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function sanitizePipeline(input: SharpPipelineOverrides): SharpPipelineOverrides {
  const out: SharpPipelineOverrides = {};
  if (typeof input.linear === "number") out.linear = clamp(input.linear, 0.98, 1.06);
  if (input.modulate) {
    out.modulate = {
      brightness: clamp(input.modulate.brightness ?? SHARP_PIPELINE.modulate.brightness, 0.98, 1.08),
      saturation: clamp(input.modulate.saturation ?? SHARP_PIPELINE.modulate.saturation, 0.96, 1.08),
    };
  }
  if (input.sharpen) {
    out.sharpen = {
      sigma: clamp(input.sharpen.sigma ?? SHARP_PIPELINE.sharpen.sigma, 0.2, 0.55),
      m1: clamp(input.sharpen.m1 ?? SHARP_PIPELINE.sharpen.m1, 0, 0.7),
      m2: clamp(input.sharpen.m2 ?? SHARP_PIPELINE.sharpen.m2, 0, 0.35),
    };
  }
  if (typeof input.normalize === "boolean") out.normalize = input.normalize;
  return out;
}

async function enhanceBufferWithPipeline(input: Buffer, overrides?: SharpPipelineOverrides): Promise<Buffer> {
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
    .jpeg({ quality: 93, mozjpeg: true })
    .withMetadata()
    .toBuffer();
}

/** Diff moyen RGB (0..255) sur aperçu réduit : permet d'éviter une retouche trop agressive. */
async function meanRgbDelta(a: Buffer, b: Buffer): Promise<number> {
  const width = 256;
  const [ra, rb] = await Promise.all([
    sharp(a).rotate().resize({ width, fit: "inside" }).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(b).rotate().resize({ width, fit: "inside" }).removeAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);

  const len = Math.min(ra.data.length, rb.data.length);
  if (!len) return 0;
  let sum = 0;
  for (let i = 0; i < len; i += 1) {
    sum += Math.abs(ra.data[i] - rb.data[i]);
  }
  return sum / len;
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
    const aiOverrides = mode === "ai" ? await orchestrateWithOpenAI(sourceUrl) : null;
    const enhancedCandidate = await enhanceBufferWithPipeline(
      buf,
      aiOverrides ? sanitizePipeline(aiOverrides) : undefined
    );
    const delta = await meanRgbDelta(buf, enhancedCandidate);
    const enhanced =
      delta > 10
        ? await enhanceBufferWithPipeline(buf, {
            ...CONSERVATIVE_PIPELINE,
          })
        : enhancedCandidate;
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
 * Orchestration OpenAI : propose un preset photo e-commerce subtil.
 */
export async function orchestrateWithOpenAI(_imageUrl: string): Promise<SharpPipelineOverrides | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  try {
    const resp = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.2,
        input: [
          {
            role: "system",
            content:
              "Tu ajustes des presets photo e-commerce pour sacs artisanaux sans alterer la couleur reelle. Reponds UNIQUEMENT en JSON avec: linear, brightness, saturation, sharpen_sigma, sharpen_m1, sharpen_m2, normalize.",
          },
          {
            role: "user",
            content:
              "Propose un preset tres subtil: nettete et lisibilite un peu meilleures, mais sans changer l'apparence du produit. Evite toute retouche agressive. JSON seulement.",
          },
        ],
      }),
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as { output_text?: string };
    const content = data.output_text?.trim();
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
