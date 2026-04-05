"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteSettings } from "@/types/database";

const steps = [
  { title: "Choix & inspiration", text: "Vous sélectionnez un modèle existant ou partagez vos idées." },
  { title: "Précisions", text: "Couleurs, matières, dimensions : nous affinons ensemble votre projet." },
  { title: "Validation", text: "Nous confirmons la faisabilité, le délai et le devis." },
  { title: "Commande", text: "Acompte sécurisé puis lancement de la fabrication ou préparation." },
  { title: "Livraison", text: "Contrôle qualité, emballage soigné, remise ou envoi." },
];

export function HowItWorksSection({ settings }: { settings: SiteSettings }) {
  const img = settings.how_it_works_image_url?.trim();

  return (
    <section id="commander" className="scroll-mt-20 bg-[var(--card)] px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Comment commander simplement
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--muted-foreground)]">
          Un parcours clair, pensé pour vous rassurer à chaque étape — du premier message à la réception de
          votre pièce.
        </p>
        <div
          className={cn(
            "mt-12",
            img && "lg:grid lg:grid-cols-2 lg:items-start lg:gap-12"
          )}
        >
          {img ? (
            <div className="relative mb-8 aspect-[4/5] max-h-[28rem] w-full overflow-hidden rounded-2xl shadow-soft ring-1 ring-[var(--border)]/80 lg:mb-0 lg:max-h-[32rem] lg:sticky lg:top-28">
              <Image src={img} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 45vw" />
            </div>
          ) : null}
          <ol className="space-y-6">
          {steps.map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.06 }}
              className="flex gap-4 rounded-2xl border border-[var(--border)]/80 bg-[var(--background)] p-5 shadow-soft"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10 text-sm font-semibold text-[var(--primary)]">
                {i + 1}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--accent)]" />
                  <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                </div>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{s.text}</p>
              </div>
            </motion.li>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
