import type { Product, ProductImage } from "@/types/database";

/** URL affichée (version améliorée si approuvée). */
export function resolvedProductImageUrl(
  img: Pick<ProductImage, "image_url" | "enhanced_image_url" | "enhancement_status">
): string {
  if (img.enhancement_status === "approved" && img.enhanced_image_url?.trim()) {
    return img.enhanced_image_url.trim();
  }
  return img.image_url;
}

function normalizedImageKey(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  // Avoid counting the same file twice when one URL has cache/query params.
  return trimmed.split("#")[0]?.split("?")[0] ?? trimmed;
}

function urlPathBasename(url: string): string {
  const normalized = normalizedImageKey(url);
  if (!normalized) return "";
  const withoutTrailingSlash = normalized.replace(/\/+$/, "");
  const parts = withoutTrailingSlash.split("/");
  return (parts[parts.length - 1] ?? "").toLowerCase();
}

/** URLs pour carrousel : couverture en premier, puis images galerie (triées, sans doublon d’URL). */
export function buildProductGalleryUrls(product: Product): string[] {
  const rows = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const secondary = rows.map((img) => resolvedProductImageUrl(img).trim()).filter(Boolean);
  const cover = product.cover_image_url?.trim() ?? "";
  const coverKey = normalizedImageKey(cover);
  const coverBase = urlPathBasename(cover);
  const coverAlreadyInGallery = rows.some((img) => {
    const candidates = [img.image_url, img.original_image_url, img.enhanced_image_url]
      .map((u) => (u ?? "").trim())
      .filter(Boolean);
    return candidates.some((candidate) => {
      const key = normalizedImageKey(candidate);
      const base = urlPathBasename(candidate);
      return Boolean(coverKey) && (key === coverKey || (coverBase && base === coverBase));
    });
  });

  const ordered = cover && !coverAlreadyInGallery ? [cover, ...secondary] : secondary;

  const seen = new Set<string>();
  const unique: string[] = [];
  for (const url of ordered) {
    const key = normalizedImageKey(url);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    unique.push(url);
  }
  return unique;
}
