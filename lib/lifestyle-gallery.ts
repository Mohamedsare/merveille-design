import type { SiteSettings } from "@/types/database";

const KEY = "lifestyle_gallery_urls";

/** URLs de la galerie lifestyle (ordre = affichage). */
export function parseLifestyleGalleryUrls(settings: SiteSettings): string[] {
  const tc = settings.theme_config as Record<string, unknown> | null | undefined;
  const raw = tc?.[KEY];
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((s) => s.trim());
}
