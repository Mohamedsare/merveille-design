"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPriceXOF } from "@/lib/utils";
import type { SiteSettings, Training } from "@/types/database";
import { TrainingBookingSheet } from "@/features/public/training-booking-sheet";

export function TrainingsSection({
  trainings,
  settings,
}: {
  trainings: Training[];
  settings: SiteSettings;
}) {
  const banner = settings.trainings_section_banner_url?.trim();

  return (
    <section id="formations" className="scroll-mt-20 bg-[var(--card)] px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Formations</h2>
        <p className="mt-3 max-w-2xl text-[var(--muted-foreground)]">
          Apprenez la fabrication de sacs et de box en atelier présentiel, dans une ambiance bienveillante
          et professionnelle.
        </p>
        {banner ? (
          <div className="relative mt-8 aspect-[21/9] max-h-64 w-full overflow-hidden rounded-2xl shadow-soft ring-1 ring-[var(--border)]/80">
            <Image src={banner} alt="" fill className="object-cover" sizes="(max-width: 1200px) 100vw, 1152px" />
          </div>
        ) : null}
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {trainings.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full overflow-hidden border-0 shadow-soft ring-1 ring-[var(--border)]/80">
                <div className="relative aspect-[16/10] bg-[var(--muted)]/30">
                  {t.cover_image_url ? (
                    <Image
                      src={t.cover_image_url}
                      alt={t.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  ) : null}
                </div>
                <CardContent className="space-y-3 p-6">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Présentiel</Badge>
                    {t.level ? <Badge variant="secondary">{t.level}</Badge> : null}
                    {t.duration ? <Badge>{t.duration}</Badge> : null}
                  </div>
                  <h3 className="font-display text-xl font-semibold">{t.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">{t.short_description}</p>
                  <p className="text-sm font-medium text-[var(--primary)]">
                    {t.pricing_mode === "quote" || t.price == null
                      ? "Tarif sur demande"
                      : formatPriceXOF(t.price)}
                  </p>
                  <TrainingBookingSheet
                    training={t}
                    trigger={<Button className="w-full sm:w-auto">Réserver une formation</Button>}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
