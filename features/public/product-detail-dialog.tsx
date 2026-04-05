"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTrackEvent } from "@/hooks/use-analytics";
import { buildProductGalleryUrls } from "@/lib/product-images";
import { formatPriceXOF } from "@/lib/utils";
import type { Product } from "@/types/database";
import { OrderSheet } from "@/features/public/order-sheet";

export function ProductDetailDialog({
  product,
  categoryName,
}: {
  product: Product;
  categoryName?: string;
}) {
  const track = useTrackEvent();
  const gallery = buildProductGalleryUrls(product);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [product.id]);

  const hasMany = gallery.length > 1;
  const current = gallery[index] ?? null;

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) void track("model_view", { productId: product.id, name: product.name });
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full px-2 text-[11px] sm:flex-1 sm:px-3 sm:text-sm"
        >
          Détails
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-hidden p-0 sm:max-w-md">
        <ScrollArea className="max-h-[90vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="pr-8 font-display text-2xl">{product.name}</DialogTitle>
              <DialogDescription className="text-left">
                {categoryName ? `${categoryName} · ` : null}
                {product.short_description}
              </DialogDescription>
            </DialogHeader>
            <div className="relative mt-4 aspect-square overflow-hidden rounded-xl bg-[var(--muted)]/30">
              {current ? (
                <Image
                  src={current}
                  alt={`${product.name} — ${index + 1}/${gallery.length}`}
                  fill
                  className="object-cover"
                  sizes="400px"
                  priority={index === 0}
                />
              ) : null}
              {hasMany ? (
                <>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute left-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-[var(--card)]/90 shadow-md"
                    aria-label="Photo précédente"
                    onClick={() => setIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full bg-[var(--card)]/90 shadow-md"
                    aria-label="Photo suivante"
                    onClick={() => setIndex((i) => (i + 1) % gallery.length)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                    {gallery.map((url, i) => (
                      <button
                        key={`${url}-${i}`}
                        type="button"
                        aria-label={`Voir la photo ${i + 1}`}
                        className={`h-2 w-2 rounded-full transition-colors ${
                          i === index ? "bg-[var(--primary)]" : "bg-[var(--card)]/80 ring-1 ring-[var(--border)]"
                        }`}
                        onClick={() => setIndex(i)}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
            {hasMany ? (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((url, i) => (
                  <button
                    key={`thumb-${url}-${i}`}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg ring-2 transition-opacity ${
                      i === index ? "ring-[var(--primary)] opacity-100" : "ring-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={url} alt="" fill className="object-cover" sizes="56px" />
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {product.is_customizable ? <Badge>Personnalisable</Badge> : null}
              {product.is_model_only ? <Badge variant="secondary">Inspiration</Badge> : null}
            </div>
            {product.description ? (
              <p className="mt-4 text-sm leading-relaxed text-[var(--muted-foreground)]">
                {product.description}
              </p>
            ) : null}
            <p className="mt-4 text-lg font-semibold text-[var(--primary)]">
              {product.pricing_mode === "quote"
                ? "Sur devis"
                : product.pricing_mode === "starting_from"
                  ? `À partir de ${formatPriceXOF(product.base_price)}`
                  : formatPriceXOF(product.base_price)}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <OrderSheet
                mode="model"
                product={product}
                trigger={<Button className="w-full">Commander ce modèle</Button>}
              />
              <OrderSheet
                mode="custom"
                product={product}
                trigger={
                  <Button variant="secondary" className="w-full">
                    Personnalisation
                  </Button>
                }
              />
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
