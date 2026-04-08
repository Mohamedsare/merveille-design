"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTrackEvent } from "@/hooks/use-analytics";
import { buildProductGalleryUrls } from "@/lib/product-images";
import { cn, formatPriceXOF } from "@/lib/utils";
import type { Category, Product, SiteSettings } from "@/types/database";
import { ProductDetailDialog } from "@/features/public/product-detail-dialog";
import { ProductImagePreviewDialog } from "@/features/public/product-image-preview-dialog";
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
            100+ Modèles & réalisations
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

        <div className="mt-10 grid grid-cols-2 gap-x-2 gap-y-4 sm:gap-x-6 sm:gap-y-6 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => {
              const cat = categories.find((c) => c.id === p.category_id);
              const galleryCount = buildProductGalleryUrls(p).length;
              return (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="border-0 shadow-soft ring-1 ring-[var(--border)]/80">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl bg-[var(--muted)]/30">
                      {p.cover_image_url ? (
                        <Image
                          src={p.cover_image_url}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1024px) 50vw, 33vw"
                        />
                      ) : null}
                      <ProductImagePreviewDialog product={p} />
                      {p.is_featured ? (
                        <Badge
                          className="absolute left-1 top-1 max-w-[calc(100%-0.5rem)] truncate px-1 py-0 text-[9px] leading-tight sm:left-3 sm:top-3 sm:max-w-none sm:px-2.5 sm:py-0.5 sm:text-xs"
                          variant="gold"
                        >
                          Coup de cœur
                        </Badge>
                      ) : null}
                      {galleryCount > 1 ? (
                        <Badge
                          className="absolute bottom-1 right-1 bg-black/60 px-1 py-0 text-[9px] text-white backdrop-blur-sm sm:bottom-3 sm:right-3 sm:px-2.5 sm:text-xs"
                          variant="secondary"
                        >
                          {galleryCount} photos
                        </Badge>
                      ) : null}
                    </div>
                    <CardContent className="space-y-1.5 p-2 sm:space-y-3 sm:p-5">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Badge variant="outline" className="max-w-full truncate text-[9px] sm:max-w-none sm:text-xs">
                          {cat?.name ?? p.type}
                        </Badge>
                        {p.is_model_only ? (
                          <Badge variant="secondary" className="max-w-full truncate text-[9px] sm:max-w-none sm:text-xs">
                            <span className="sm:hidden">Réf.</span>
                            <span className="hidden sm:inline">Modèle référence</span>
                          </Badge>
                        ) : null}
                        {p.is_customizable ? (
                          <Badge className="text-[9px] sm:text-xs">
                            <span className="sm:hidden">Perso</span>
                            <span className="hidden sm:inline">Personnalisable</span>
                          </Badge>
                        ) : null}
                      </div>
                      <h3 className="font-display text-[13px] font-semibold leading-tight sm:text-lg sm:leading-snug">
                        {p.name}
                      </h3>
                      <p className="line-clamp-2 text-xs text-[var(--muted-foreground)] sm:text-sm">
                        {p.short_description}
                      </p>
                      <p className="text-xs font-medium text-[var(--primary)] sm:text-sm">
                        {p.pricing_mode === "quote"
                          ? "Sur devis"
                          : p.pricing_mode === "starting_from"
                            ? `À partir de ${formatPriceXOF(p.base_price)}`
                            : formatPriceXOF(p.base_price)}
                      </p>
                      <div className="grid grid-cols-1 gap-1.5 pt-0.5 sm:grid-cols-2 sm:gap-2 sm:pt-1 lg:grid-cols-3">
                        <ProductDetailDialog product={p} categoryName={cat?.name} />
                        <OrderSheet
                          mode="model"
                          product={p}
                          trigger={
                            <Button
                              variant="default"
                              className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-[9px] leading-none sm:px-3 sm:text-[10px] md:text-xs"
                              size="sm"
                            >
                              Commander
                            </Button>
                          }
                        />
                        <OrderSheet
                          mode="custom"
                          product={p}
                          trigger={
                            <Button
                              variant="outline"
                              className="w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap px-2 text-[9px] leading-none sm:px-3 sm:text-[10px] md:text-xs sm:col-span-2 lg:col-span-1"
                              size="sm"
                            >
                              <span className="sm:hidden">Perso.</span>
                              <span className="hidden sm:inline">Personnaliser</span>
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
            <div className="models-voir-plus-wrap">
              <button
                type="button"
                className="models-voir-plus-inner"
                onClick={() => setVisible((v) => v + 6)}
              >
                <Sparkles
                  className="models-voir-plus-icon h-3.5 w-3.5 shrink-0 text-[var(--accent)]"
                  aria-hidden
                />
                Voir plus
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
