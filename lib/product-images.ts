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

/** URLs pour carrousel : couverture en premier, puis images galerie (triées, sans doublon d’URL). */
export function buildProductGalleryUrls(product: Product): string[] {
  const rows = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const secondary = rows.map(resolvedProductImageUrl);
  const cover = product.cover_image_url?.trim() ?? "";
  if (!cover) return secondary.length ? secondary : [];
  const rest = secondary.filter((u) => u !== cover);
  return [cover, ...rest];
}
