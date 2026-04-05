"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteProduct, upsertProduct } from "@/actions/admin-products";
import { AdminImageField } from "@/components/admin/admin-image-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Category, Product } from "@/types/database";

export function ProductsAdmin({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Product | null>(null);
  const [pending, startTransition] = useTransition();

  function close() {
    setOpen(false);
    setEdit(null);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: fd.get("name"),
      slug: fd.get("slug"),
      category_id: fd.get("category_id") || null,
      type: fd.get("type"),
      short_description: fd.get("short_description") || "",
      description: fd.get("description") || "",
      base_price: fd.get("base_price") ? Number(fd.get("base_price")) : null,
      pricing_mode: fd.get("pricing_mode"),
      is_customizable: fd.get("is_customizable") === "on",
      is_model_only: fd.get("is_model_only") === "on",
      is_featured: fd.get("is_featured") === "on",
      is_published: fd.get("is_published") === "on",
      cover_image_url: fd.get("cover_image_url") || "",
      display_order: fd.get("display_order") ? Number(fd.get("display_order")) : 0,
    };
    startTransition(async () => {
      const res = await upsertProduct(edit?.id ?? null, raw);
      if (res.ok) {
        toast.success(edit ? "Produit mis à jour" : "Produit créé");
        close();
      } else toast.error("error" in res ? res.error : "Erreur");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEdit(null);
            setOpen(true);
          }}
        >
          Nouveau produit
        </Button>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEdit(null);
          }}
        >
          <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{edit ? "Modifier" : "Créer"} un produit</DialogTitle>
            </DialogHeader>
            <form key={edit?.id ?? "new"} className="space-y-3 pt-2" onSubmit={onSubmit}>
              <div className="space-y-1">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" name="name" defaultValue={edit?.name} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" defaultValue={edit?.slug} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label>Type</Label>
                  <select
                    name="type"
                    className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm"
                    defaultValue={edit?.type ?? "bag"}
                  >
                    <option value="bag">Sac</option>
                    <option value="box">Box</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Catégorie</Label>
                  <select
                    name="category_id"
                    className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm"
                    defaultValue={edit?.category_id ?? ""}
                  >
                    <option value="">—</option>
                    {categories
                      .filter((c) => c.type === "bag" || c.type === "box")
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="short_description">Résumé</Label>
                <Input
                  id="short_description"
                  name="short_description"
                  defaultValue={edit?.short_description ?? ""}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" defaultValue={edit?.description ?? ""} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="base_price">Prix (FCFA)</Label>
                  <Input
                    id="base_price"
                    name="base_price"
                    type="number"
                    defaultValue={edit?.base_price ?? ""}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Mode prix</Label>
                  <select
                    name="pricing_mode"
                    className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm"
                    defaultValue={edit?.pricing_mode ?? "quote"}
                  >
                    <option value="fixed">Fixe</option>
                    <option value="quote">Devis</option>
                    <option value="starting_from">À partir de</option>
                  </select>
                </div>
              </div>
              <AdminImageField
                key={`cover-${edit?.id ?? "new"}`}
                name="cover_image_url"
                folder="products"
                label="Image de couverture"
                defaultUrl={edit?.cover_image_url}
              />
              <div className="space-y-1">
                <Label htmlFor="display_order">Ordre</Label>
                <Input
                  id="display_order"
                  name="display_order"
                  type="number"
                  defaultValue={edit?.display_order ?? 0}
                />
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_published" defaultChecked={edit?.is_published} />
                  Publié
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_featured" defaultChecked={edit?.is_featured} />
                  Vedette
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_customizable" defaultChecked={edit?.is_customizable ?? true} />
                  Personnalisable
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" name="is_model_only" defaultChecked={edit?.is_model_only} />
                  Modèle ref.
                </label>
              </div>
              <Button type="submit" className="w-full" disabled={pending}>
                Enregistrer
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--card)]">
        {products.map((p) => (
          <li key={p.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {p.type} · {p.is_published ? "publié" : "brouillon"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEdit(p);
                  setOpen(true);
                }}
              >
                Modifier
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!confirm("Supprimer ce produit ?")) return;
                  startTransition(async () => {
                    const res = await deleteProduct(p.id);
                    if (res.ok) toast.success("Supprimé");
                    else toast.error(res.error);
                  });
                }}
              >
                Supprimer
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
