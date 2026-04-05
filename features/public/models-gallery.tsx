"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTrackEvent } from "@/hooks/use-analytics";
import { cn, formatPriceXOF } from "@/lib/utils";
import type { Category, Product, SiteSettings } from "@/types/database";
import { ProductDetailDialog } from "@/features/public/product-detail-dialog";
import { OrderSheet } from "@/features/public/order-sheet";

type Filter = "all" | "bag" | "box";

export function ModelsGallery({
  products,
  categories,
  settings,
}: {
  products: Product[];
  categories: Category[];
  settings: SiteSettings;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [visible, setVisible] = useState(6);
  const track = useTrackEvent();

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchType = filter === "all" || p.type === filter;
      const text = `${p.name} ${p.short_description ?? ""} ${(p.tags ?? []).join(" ")}`.toLowerCase();
      const matchQ = !q.trim() || text.includes(q.toLowerCase());
      return matchType && matchQ;
    });
  }, [products, filter, q]);

  const shown = filtered.slice(0, visible);

  return (
    <section id="modeles" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Galerie de modèles
          </h2>
          <p className="mt-3 text-[var(--muted-foreground)]">
            Chaque pièce peut servir de base : couleurs, matières et finitions s’adaptent à votre style.
          </p>
        </div>

        {settings.models_section_banner_url?.trim() ? (
          <div className="relative mt-8 aspect-[21/9] max-h-72 w-full overflow-hidden rounded-2xl shadow-soft ring-1 ring-[var(--border)]/80">
            <Image
              src={settings.models_section_banner_url.trim()}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1152px"
            />
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
            <Input
              placeholder="Rechercher un modèle…"
              className="pl-10"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                void track("product_search_use", { q: e.target.value });
              }}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "all" as const, label: "Tout" },
                { id: "bag" as const, label: "Sacs" },
                { id: "box" as const, label: "Box" },
              ] as const
            ).map((tab) => (
              <Button
                key={tab.id}
                type="button"
                size="sm"
                variant={filter === tab.id ? "default" : "secondary"}
                onClick={() => {
                  setFilter(tab.id);
                  void track("product_filter_use", { filter: tab.id });
                }}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => {
              const cat = categories.find((c) => c.id === p.category_id);
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="overflow-hidden border-0 shadow-soft ring-1 ring-[var(--border)]/80">
                    <div className="relative aspect-[4/5] bg-[var(--muted)]/30">
                      {p.cover_image_url ? (
                        <Image
                          src={p.cover_image_url}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : null}
                      {p.is_featured ? (
                        <Badge className="absolute left-3 top-3" variant="gold">
                          Coup de cœur
                        </Badge>
                      ) : null}
                    </div>
                    <CardContent className="space-y-3 p-5">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{cat?.name ?? p.type}</Badge>
                        {p.is_model_only ? <Badge variant="secondary">Modèle référence</Badge> : null}
                        {p.is_customizable ? <Badge>Personnalisable</Badge> : null}
                      </div>
                      <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                      <p className="line-clamp-2 text-sm text-[var(--muted-foreground)]">
                        {p.short_description}
                      </p>
                      <p className="text-sm font-medium text-[var(--primary)]">
                        {p.pricing_mode === "quote"
                          ? "Sur devis"
                          : p.pricing_mode === "starting_from"
                            ? `À partir de ${formatPriceXOF(p.base_price)}`
                            : formatPriceXOF(p.base_price)}
                      </p>
                      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
                        <ProductDetailDialog product={p} categoryName={cat?.name} />
                        <OrderSheet
                          mode="model"
                          product={p}
                          trigger={
                            <Button variant="secondary" className="w-full sm:flex-1" size="sm">
                              Commander ce modèle
                            </Button>
                          }
                        />
                        <OrderSheet
                          mode="custom"
                          product={p}
                          trigger={
                            <Button variant="outline" className="w-full sm:flex-1" size="sm">
                              Personnaliser
                            </Button>
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 text-center text-[var(--muted-foreground)]">Aucun modèle ne correspond.</p>
        ) : null}

        {visible < filtered.length ? (
          <div className="mt-10 flex justify-center">
            <Button variant="secondary" onClick={() => setVisible((v) => v + 6)}>
              Voir plus
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
