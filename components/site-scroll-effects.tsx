"use client";

import { usePathname } from "next/navigation";
import { PremiumScroll } from "@/features/public/premium-scroll";

/** Effets de scroll premium sur le site vitrine uniquement (pas l’admin). */
export function SiteScrollEffects() {
  const pathname = usePathname() ?? "";
  if (pathname.startsWith("/admin")) return null;
  return <PremiumScroll />;
}
