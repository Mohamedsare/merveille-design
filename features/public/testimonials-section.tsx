"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SiteSettings } from "@/types/database";

const items = [
  {
    name: "Aïcha K.",
    role: "Cliente — Ouagadougou",
    text: "Mon sac cabas est magnifique. Les finitions sont impeccables et le délai a été respecté.",
  },
  {
    name: "Marina D.",
    role: "Créatrice",
    text: "Les coffrets pour mon lancement ont fait toute la différence. Service très professionnel.",
  },
  {
    name: "Fatou B.",
    role: "Ancienne participante formation",
    text: "J’ai gagné en confiance sur le patronage. Groupe réduit, pédagogie au top.",
  },
];

export function TestimonialsSection({ settings }: { settings: SiteSettings }) {
  const banner = settings.testimonials_section_image_url?.trim();

  return (
    <section className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Elles nous font confiance
        </h2>
        <p className="mt-3 text-[var(--muted-foreground)]">
          Des centaines de modèles réalisés, des clientes satisfaites et des apprenantes accompagnées.
        </p>
        {banner ? (
          <div className="relative mt-8 aspect-[21/9] max-h-80 w-full overflow-hidden rounded-2xl shadow-soft ring-1 ring-[var(--border)]/80">
            <Image src={banner} alt="" fill className="object-cover" sizes="(max-width: 1200px) 100vw, 1152px" />
          </div>
        ) : null}
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="h-full border-0 shadow-soft ring-1 ring-[var(--border)]/80">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-[var(--accent)]/60" />
                  <p className="mt-4 text-sm leading-relaxed text-[var(--foreground)]">{item.text}</p>
                  <p className="mt-4 text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">{item.role}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-center text-sm text-[var(--muted-foreground)]">
          <div>
            <p className="font-display text-3xl font-semibold text-[var(--primary)]">100+</p>
            <p>Modèles & réalisations</p>
          </div>
          <div>
            <p className="font-display text-3xl font-semibold text-[var(--primary)]">98%</p>
            <p>Satisfaction déclarée</p>
          </div>
          <div>
            <p className="font-display text-3xl font-semibold text-[var(--primary)]">25+</p>
            <p>Apprenantes formées</p>
          </div>
        </div>
      </div>
    </section>
  );
}
