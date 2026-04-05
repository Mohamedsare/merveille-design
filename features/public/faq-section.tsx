"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Comment commander ?",
    a: "Choisissez un modèle ou décrivez votre idée via le formulaire. Nous revenons vers vous avec un devis et un planning.",
  },
  {
    q: "Quel est le délai de fabrication ?",
    a: "Selon la complexité, comptez en général 2 jours  à 4 jours et 1 semaine maximum. Nous confirmons un délai précis à la validation du devis.",
  },
  {
    q: "Puis-je personnaliser à partir d’un modèle existant ?",
    a: "Oui, c’est même recommandé : nos modèles servent de base pour couleurs, tailles et finitions.",
  },
  {
    q: "Livrez-vous hors Bobo-Dioulasso ?",
    a: "Oui, au Burkina Faso et à l’international selon les options d’expédition disponibles.",
  },
  {
    q: "Comment se passe le paiement ?",
    a: "Acompte à la commande, solde avant expédition ou remise. Moyens précisés sur le devis.",
  },
  {
    q: "Les formations sont-elles pour débutantes ?",
    a: "Oui, nous proposons des niveaux initiation et perfectionnement. Précisez votre niveau à l’inscription.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-20 bg-(--card) px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-3xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          Questions fréquentes
        </h2>
        <p className="mt-3 text-(--muted-foreground)">
          Les réponses aux objections les plus courantes — pour avancer sereinement.
        </p>
        <ul className="mt-10 space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.li
                key={item.q}
                initial={false}
                className="overflow-hidden rounded-2xl border border-(--border) bg-background"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  {item.q}
                  <ChevronDown
                    className={cn("h-5 w-5 shrink-0 transition-transform", isOpen && "rotate-180")}
                  />
                </button>
                {isOpen ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="border-t border-(--border) px-5 py-4 text-sm text-(--muted-foreground)"
                  >
                    {item.a}
                  </motion.div>
                ) : null}
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
