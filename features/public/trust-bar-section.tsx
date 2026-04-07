"use client";

import { Clock3, ShieldCheck, Truck } from "lucide-react";

const items = [
  {
    icon: Clock3,
    title: "Reponse sous 24h",
    text: "Accompagnement rapide sur WhatsApp et formulaire.",
  },
  {
    icon: ShieldCheck,
    title: "Commande sur devis securisee",
    text: "Validation claire du prix, delai et personnalisation.",
  },
  {
    icon: Truck,
    title: "Livraison Burkina & Afrique",
    text: "Remise locale a Bobo/Ouaga et envoi dans la sous-region.",
  },
];

export function TrustBarSection() {
  return (
    <section className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto grid max-w-6xl gap-3 rounded-2xl border border-[var(--border)]/80 bg-[var(--card)] p-4 shadow-soft sm:grid-cols-3 sm:gap-4 sm:p-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-xl bg-[var(--background)] p-4">
              <Icon className="h-5 w-5 text-[var(--accent)]" />
              <p className="mt-3 text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{item.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
