"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Product, SiteSettings } from "@/types/database";
import { OrderSheet } from "@/features/public/order-sheet";

const BOX_FALLBACK =
  "https://images.unsplash.com/photo-1549465220-576843087d93?w=900&q=85";

export function BoxSection({
  boxProducts,
  settings,
}: {
  boxProducts: Product[];
  settings: SiteSettings;
}) {
  const featured = boxProducts[0];
  const src =
    settings.box_section_image_url?.trim() || featured?.cover_image_url || BOX_FALLBACK;

  return (
    <section id="box" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-soft ring-1 ring-[var(--border)]"
        >
          <Image
            src={src}
            alt="Box cadeaux Merveill design"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </motion.div>
        <div>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Box & coffrets cadeaux
          </h2>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Emballages sur mesure pour vos marques, événements et cadeaux d’affaires. Formats, papiers,
            rubans et marquage : chaque coffret raconte une histoire et valorise ce qu’il contient.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-[var(--foreground)]">
            <li>· Mariage, anniversaire, lancement produit</li>
            <li>· Petites séries pour créatrices et boutiques</li>
            <li>· Personnalisation logo & couleurs de marque</li>
          </ul>
          {featured ? (
            <div className="mt-8">
              <OrderSheet
                mode="model"
                formVariant="box_quote"
                product={featured}
                trigger={<Button size="lg">Demander un devis box</Button>}
              />
            </div>
          ) : (
            <Button size="lg" className="mt-8" asChild>
              <a href="#contact">Demander un devis box</a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
