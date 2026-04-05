"use client";

import Image from "next/image";
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

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) void track("model_view", { productId: product.id, name: product.name });
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full sm:flex-1">
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
              {product.cover_image_url ? (
                <Image
                  src={product.cover_image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="400px"
                />
              ) : null}
            </div>
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
