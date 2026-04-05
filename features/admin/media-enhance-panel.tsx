"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { requestImageEnhancement } from "@/actions/admin-products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Row = {
  id: string;
  image_url: string;
  enhancement_status: string;
  product_id: string;
  products: { name: string } | null;
};

export function MediaEnhancePanel({ rows }: { rows: Row[] }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted-foreground)]">
        Traitement subtil (luminosité, contraste, netteté) via Sharp. Créez le bucket Supabase{" "}
        <code className="rounded bg-[var(--muted)] px-1">media</code> avec politiques admin.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((r) => (
          <li
            key={r.id}
            className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-soft"
          >
            <div className="relative aspect-square bg-[var(--muted)]/30">
              <Image src={r.image_url} alt="" fill className="object-cover" sizes="200px" unoptimized />
            </div>
            <div className="space-y-2 p-4">
              <p className="text-sm font-medium">{r.products?.name ?? "Produit"}</p>
              <Badge variant="outline">{r.enhancement_status}</Badge>
              <Button
                type="button"
                size="sm"
                className="w-full"
                disabled={pending}
                onClick={() => {
                  startTransition(async () => {
                    const res = await requestImageEnhancement(r.id);
                    if (res.ok) toast.success("Traitement lancé");
                    else toast.error("error" in res ? res.error : "Erreur");
                  });
                }}
              >
                Améliorer
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {rows.length === 0 ? (
        <p className="text-center text-sm text-[var(--muted-foreground)]">
          Aucune image produit. Ajoutez des images depuis les fiches produits (à venir) ou en base.
        </p>
      ) : null}
    </div>
  );
}
