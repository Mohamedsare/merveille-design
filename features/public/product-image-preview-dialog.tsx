"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTrackEvent } from "@/hooks/use-analytics";
import { buildProductGalleryUrls } from "@/lib/product-images";
import type { Product } from "@/types/database";

export function ProductImagePreviewDialog({ product }: { product: Product }) {
  const track = useTrackEvent();
  const gallery = buildProductGalleryUrls(product);
  const [index, setIndex] = useState(0);
  const current = gallery[index] ?? product.cover_image_url ?? null;

  if (!current) return null;

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) {
          setIndex(0);
          void track("product_image_preview_open", { productId: product.id, name: product.name });
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="absolute inset-0 z-10"
          aria-label={`Voir la photo de ${product.name} en grand format`}
        />
      </DialogTrigger>
      <DialogContent className="w-[min(96vw,1100px)] max-w-none overflow-hidden p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Galerie photo - {product.name}</DialogTitle>
        </DialogHeader>
        <div className="relative h-[78vh] w-full max-h-[86vh] bg-black sm:h-[82vh]">
          <Image
            src={current}
            alt={`${product.name} - vue ${index + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 70vw"
          />
          {gallery.length > 1 ? (
            <>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute left-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full"
                aria-label="Photo précédente"
                onClick={() => setIndex((i) => (i - 1 + gallery.length) % gallery.length)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full"
                aria-label="Photo suivante"
                onClick={() => setIndex((i) => (i + 1) % gallery.length)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
