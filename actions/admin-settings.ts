"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const optImg = z.union([z.literal(""), z.string().url()]).optional();

const settingsSchema = z.object({
  site_name: z.string().min(1),
  hero_title: z.string().optional(),
  hero_subtitle: z.string().optional(),
  hero_image_url: optImg,
  box_section_image_url: optImg,
  models_section_banner_url: optImg,
  trainings_section_banner_url: optImg,
  how_it_works_image_url: optImg,
  testimonials_section_image_url: optImg,
  faq_section_image_url: optImg,
  contact_section_image_url: optImg,
  whatsapp_number: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_keywords: z.string().optional(),
});

export async function updateSiteSettings(id: string, raw: unknown) {
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: "Validation" };
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };
  const v = parsed.data;
  const { error } = await supabase
    .from("site_settings")
    .update({
      site_name: v.site_name,
      hero_title: v.hero_title ?? null,
      hero_subtitle: v.hero_subtitle ?? null,
      hero_image_url: v.hero_image_url || null,
      box_section_image_url: v.box_section_image_url || null,
      models_section_banner_url: v.models_section_banner_url || null,
      trainings_section_banner_url: v.trainings_section_banner_url || null,
      how_it_works_image_url: v.how_it_works_image_url || null,
      testimonials_section_image_url: v.testimonials_section_image_url || null,
      faq_section_image_url: v.faq_section_image_url || null,
      contact_section_image_url: v.contact_section_image_url || null,
      whatsapp_number: v.whatsapp_number ?? null,
      contact_email: v.contact_email || null,
      seo_title: v.seo_title ?? null,
      seo_description: v.seo_description ?? null,
      seo_keywords: v.seo_keywords ?? null,
    })
    .eq("id", id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/");
  revalidatePath("/admin/dashboard/settings");
  return { ok: true as const };
}
