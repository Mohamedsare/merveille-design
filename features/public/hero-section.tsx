"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTrackEvent } from "@/hooks/use-analytics";
import type { SiteSettings } from "@/types/database";

export function HeroSection({ settings }: { settings: SiteSettings }) {
  const track = useTrackEvent();

  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 sm:pt-14 md:pb-28">
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-[var(--accent)]/15 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-[var(--primary)]/5 blur-3xl" />
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="gold" className="mb-4 gap-1">
              <Sparkles className="h-3 w-3" />
              Artisanat & sur mesure à Bobo-Dioulasso — Burkina Faso
            </Badge>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-[var(--foreground)] sm:text-5xl lg:text-[3.25rem]">
              {settings.hero_title ?? "Sacs & box d’exception, pensés pour vous"}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--muted-foreground)] sm:text-lg">
              {settings.hero_subtitle ??
                "Découvrez nos modèles, personnalisez chaque détail, ou réservez une formation créative."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={() => void track("hero_cta_click", { cta: "commander" })}
                asChild
              >
                <a href="#commander">Commander maintenant</a>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => void track("hero_cta_click", { cta: "modeles" })}
                asChild
              >
                <a href="#modeles">Voir les modèles</a>
              </Button>
            </div>
            <p className="mt-6 text-xs text-[var(--muted-foreground)]">
              Réponse sous 24h · Paiement sécurisé sur devis · Livraison au Burkina et à l’international
            </p>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.55 }}
          className="relative mx-auto aspect-[4/5] w-full max-w-md lg:max-w-none"
        >
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[var(--card)] to-[var(--muted)]/40 shadow-soft ring-1 ring-[var(--border)]" />
          <div className="relative h-full overflow-hidden rounded-[2rem]">
            <Image
              src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=900&q=85"
              alt="Sac artisanal premium Merveill design"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
