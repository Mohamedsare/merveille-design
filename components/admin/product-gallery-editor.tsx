"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { addProductImage, deleteProductImage } from "@/actions/admin-products";
import { uploadAdminMedia } from "@/actions/admin-media";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { resolvedProductImageUrl } from "@/lib/product-images";
import type { ProductImage } from "@/types/database";

export function ProductGalleryEditor({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", "products");
    const up = await uploadAdminMedia(fd);
    if (!up.ok) {
      setUploading(false);
      toast.error(up.error);
      return;
    }
    const add = await addProductImage(productId, up.url);
    setUploading(false);
    if (add.ok) {
      toast.success("Image ajoutée à la galerie");
      refresh();
    } else toast.error(add.error);
  };

  const onDelete = async (imageId: string) => {
    if (!confirm("Retirer cette image de la galerie ?")) return;
    setPendingId(imageId);
    const res = await deleteProductImage(imageId);
    setPendingId(null);
    if (res.ok) {
      toast.success("Image retirée");
      refresh();
    } else toast.error(res.error);
  };

  return (
    <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--muted)]/20 p-4">
      <div>
        <Label>Galerie — photos supplémentaires</Label>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          L’image de couverture reste celle du champ ci-dessus. Ajoutez ici d’autres vues (détail, dos, porté…).
        </p>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={onFile}
      />
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={uploading}
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? "Envoi…" : "Ajouter une photo à la galerie"}
      </Button>
      {sorted.length ? (
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {sorted.map((img) => (
            <li
              key={img.id}
              className="relative aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)]"
            >
              <Image
                src={resolvedProductImageUrl(img)}
                alt=""
                fill
                className="object-cover"
                sizes="120px"
                unoptimized
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="absolute bottom-1 right-1 h-7 bg-[var(--card)]/90 text-xs"
                disabled={pendingId === img.id}
                onClick={() => void onDelete(img.id)}
              >
                Retirer
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-[var(--muted-foreground)]">Aucune photo en galerie pour l’instant.</p>
      )}
    </div>
  );
}
