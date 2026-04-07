"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { SiteSettings } from "@/types/database";

const STORY_FALLBACK =
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1400&q=80";

export function BrandStorySection({ settings }: { settings: SiteSettings }) {
  const themeConfig = (settings.theme_config ?? {}) as Record<string, unknown>;
  const brandStoryImage =
    typeof themeConfig.brand_story_image_url === "string" ? themeConfig.brand_story_image_url : "";
  const imageSrc = brandStoryImage.trim() || settings.how_it_works_image_url?.trim() || STORY_FALLBACK;

  return (
    <section id="histoire" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-soft ring-1 ring-[var(--border)]/80"
        >
          <Image
            src={imageSrc}
            alt="Atelier de creation artisanale Merveill'S Design"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 48vw"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Notre histoire, notre signature
          </h2>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Merveill&apos;S Design nait d&apos;une passion profonde pour l&apos;artisanat africain et le beau
            travail manuel. Chaque creation celebre le savoir-faire local, avec une finition premium
            pensee pour les femmes modernes.
          </p>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Notre mission est simple : proposer des sacs uniques, elegants et durables, fabriques avec
            soin, pour que chaque cliente ressente fierte, style et confiance au quotidien.
          </p>
          <p className="mt-4 text-sm font-medium text-[var(--primary)]">
            Plus qu&apos;un accessoire, chaque piece raconte une histoire.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
