export const ADMIN_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const ADMIN_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export function safeImageExtension(filename: string, mime: string): string {
  const fromName = filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpg" ? "jpeg" : fromName;
  }
  if (mime === "image/jpeg") return "jpeg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "bin";
}

export function validateImageFile(file: File): { ok: true } | { ok: false; error: string } {
  if (!file.size) return { ok: false, error: "Fichier vide" };
  if (file.size > ADMIN_IMAGE_MAX_BYTES) {
    return { ok: false, error: "Image trop volumineuse (max 5 Mo)" };
  }
  if (!ADMIN_IMAGE_MIME.includes(file.type as (typeof ADMIN_IMAGE_MIME)[number])) {
    return { ok: false, error: "Format accepté : JPEG, PNG, WebP, GIF" };
  }
  return { ok: true };
}
