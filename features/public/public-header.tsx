"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/types/database";

const nav = [
  { href: "#modeles", label: "Modèles" },
  { href: "#histoire", label: "Histoire" },
  { href: "#commander", label: "Commander" },
  { href: "#box", label: "Box cadeaux" },
  { href: "#formations", label: "Formations" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export function PublicHeader({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 12);
  });

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-md transition-[box-shadow,background-color,border-color] duration-300 ease-out",
        scrolled
          ? "border-[var(--border)] bg-[var(--background)]/95 shadow-soft"
          : "border-[var(--border)]/80 bg-[var(--background)]/85"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label={settings.site_name}>
          <BrandLogo variant="header" priority alt={settings.site_name} />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)]/50 hover:text-[var(--foreground)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          <Button asChild size="sm">
            <a href="#commander">Commander maintenant</a>
          </Button>
        </div>
        <button
          type="button"
          className="rounded-full p-2 md:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <div
        className={cn(
          "border-t border-[var(--border)] bg-[var(--background)] md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-xl px-3 py-3 text-sm font-medium"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <Button asChild className="mt-2 w-full">
            <a href="#commander" onClick={() => setOpen(false)}>
              Commander maintenant
            </a>
          </Button>
        </nav>
      </div>
    </motion.header>
  );
}
