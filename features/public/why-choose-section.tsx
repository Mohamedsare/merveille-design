"use client";

import { motion } from "framer-motion";
import { Leaf, Palette, ShieldCheck, Sparkles, Wrench } from "lucide-react";

const values = [
  {
    title: "Fabrication artisanale",
    text: "Chaque sac est réalisé à la main avec une attention minutieuse aux finitions.",
    icon: Sparkles,
  },
  {
    title: "Design unique",
    text: "Des lignes modernes inspirées de l'art africain pour un style qui vous distingue.",
    icon: Palette,
  },
  {
    title: "Sacs durables",
    text: "Des matériaux choisis pour durer, pensés pour un usage quotidien élégant.",
    icon: ShieldCheck,
  },
  {
    title: "Inspiration africaine",
    text: "Des touches culturelles locales revisitées dans une esthétique premium et contemporaine.",
    icon: Leaf,
  },
  {
    title: "Personnalisation possible",
    text: "Couleurs, détails et finitions ajustés selon vos envies et votre occasion.",
    icon: Wrench,
  },
];

export function WhyChooseSection() {
  return (
    <section className="bg-[var(--card)] px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Pourquoi choisir Merveill&apos;S Design
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--muted-foreground)]">
          Une marque artisanale premium du Burkina Faso qui allie elegance, identite locale et exigence
          de qualite.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.article
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-[var(--border)]/80 bg-[var(--background)] p-5 shadow-soft"
              >
                <Icon className="h-5 w-5 text-[var(--accent)]" />
                <h3 className="mt-4 font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{item.text}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
