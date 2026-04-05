/**
 * URL publique du site (SEO, Open Graph, liens absolus).
 * Sur Vercel, `VERCEL_URL` est défini automatiquement si `NEXT_PUBLIC_SITE_URL` est absent.
 */
export function getPublicSiteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (explicit) {
    try {
      return new URL(explicit.startsWith("http") ? explicit : `https://${explicit}`);
    } catch {
      /* fallback */
    }
  }
  const vercel = process.env.VERCEL_URL;
  if (vercel) {
    return new URL(`https://${vercel}`);
  }
  return new URL("http://localhost:3000");
}
