"use client";

import Image from "next/image";
import { buildProductGalleryUrls } from "@/lib/product-images";
import type { Product } from "@/types/database";

export function LifestyleGallerySection({ products }: { products: Product[] }) {
  const images = products
    .flatMap((product) => {
      const urls = buildProductGalleryUrls(product);
      return urls.map((url, idx) => ({
        id: `${product.id}-${idx}`,
        url,
        alt: `${product.name} - photo lifestyle`,
      }));
    })
    .slice(0, 9);

  if (images.length === 0) return null;

  return (
    <section className="px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Galerie lifestyle</h2>
        <p className="mt-3 max-w-2xl text-[var(--muted-foreground)]">
          Des sacs portes, utilises et mis en situation pour vous aider a vous projeter avant commande.
        </p>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {images.map((image, idx) => (
            <article
              key={image.id}
              className={idx % 5 === 0 ? "relative aspect-[4/5] overflow-hidden rounded-2xl" : "relative aspect-square overflow-hidden rounded-2xl"}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
