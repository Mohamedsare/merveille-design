"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function FinalCtaSection() {
  return (
    <section className="px-4 pb-4 pt-2 sm:px-6 md:pb-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-6xl rounded-[2rem] border border-[var(--border)]/80 bg-gradient-to-br from-[var(--accent)]/20 via-[var(--card)] to-[var(--muted)] p-8 text-center shadow-soft md:p-12"
      >
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-[var(--primary)]">Collection premium</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Offrez-vous un sac unique
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--muted-foreground)]">
          Commandez une piece qui vous ressemble, fabriquee avec exigence et elegance au Burkina Faso.
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
            <a href="#commander">Commander maintenant</a>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
