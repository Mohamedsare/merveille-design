"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ProductGalleryEditor } from "@/components/admin/product-gallery-editor";
import { deleteProduct, upsertProduct } from "@/actions/admin-products";
import { AdminImageField } from "@/components/admin/admin-image-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPriceXOF } from "@/lib/utils";
import type { Category, Product } from "@/types/database";

export function ProductsAdmin({
  products,
  categories,
  q,
  type,
  published,
  page,
  totalPages,
  prevHref,
  nextHref,
}: {
  products: Product[];
  categories: Category[];
  q: string;
  type: string;
  published: string;
  page: number;
  totalPages: number;
  prevHref: string;
  nextHref: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Product | null>(null);
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState(q);
  const [typeFilter, setTypeFilter] = useState(type);
  const [publishedFilter, setPublishedFilter] = useState(published);

  useEffect(() => {
    setQuery(q);
  }, [q]);
  useEffect(() => {
    setTypeFilter(type);
  }, [type]);
  useEffect(() => {
    setPublishedFilter(published);
  }, [published]);

  function applyFilters(next: { q?: string; type?: string; published?: string }) {
    const params = new URLSearchParams();
    const nq = (next.q ?? query).trim();
    const nt = next.type ?? typeFilter;
    const np = next.published ?? publishedFilter;
    if (nq) params.set("q", nq);
    if (nt && nt !== "all") params.set("type", nt);
    if (np && np !== "all") params.set("published", np);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }

  useEffect(() => {
    const t = setTimeout(() => {
      applyFilters({ q: query });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

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
        if (res.warning) {
          toast.warning(edit ? "Produit mis à jour" : "Produit créé", {
            description: res.warning,
          });
          close();
          return;
        }
        const hasCover = typeof raw.cover_image_url === "string" && raw.cover_image_url.trim() !== "";
        if (hasCover) {
          toast.success(edit ? "Produit mis à jour" : "Produit créé", {
            description:
              "Optimisation automatique de l'image de couverture appliquée (mode rapide). Rechargez la boutique si la vignette tarde à se rafraîchir.",
          });
        } else if (!edit) {
          toast.success("Produit créé", {
            description:
              "Ajoutez une image de couverture ou des photos de galerie : l'amélioration se fera automatiquement à l'ajout.",
          });
        } else {
          toast.success("Produit mis à jour");
        }
        close();
      } else toast.error("error" in res ? res.error : "Erreur");
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_170px_170px_auto]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher nom ou slug..."
            className="h-10"
          />
          <select
            value={typeFilter}
            onChange={(e) => {
              const v = e.target.value;
              setTypeFilter(v);
              applyFilters({ type: v });
            }}
            className="h-10 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm"
          >
            <option value="all">Tous les types</option>
            <option value="bag">Sacs</option>
            <option value="box">Box</option>
          </select>
          <select
            value={publishedFilter}
            onChange={(e) => {
              const v = e.target.value;
              setPublishedFilter(v);
              applyFilters({ published: v });
            }}
            className="h-10 rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés</option>
            <option value="draft">Brouillons</option>
          </select>
          <div className="flex justify-end">
            <Button
              size="icon"
              className="hidden h-12 w-12 rounded-xl md:inline-flex"
              aria-label="Nouveau produit"
              title="Nouveau produit"
              onClick={() => {
                setEdit(null);
                setOpen(true);
              }}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      <Button
        size="icon"
        className="fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:hidden"
        aria-label="Nouveau produit"
        title="Nouveau produit"
        onClick={() => {
          setEdit(null);
          setOpen(true);
        }}
      >
        <Plus className="h-6 w-6" />
      </Button>
      <div className="flex justify-end">
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
              {edit?.id ? (
                <ProductGalleryEditor
                  productId={edit.id}
                  images={edit.product_images ?? []}
                />
              ) : null}
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

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] lg:overflow-x-auto">
        <div className="lg:min-w-[920px]">
          <div className="hidden grid-cols-12 gap-1 border-b border-[var(--border)]/80 bg-[var(--muted)]/30 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] lg:grid">
            <p className="col-span-2 whitespace-nowrap">Image</p>
            <p className="col-span-6 whitespace-nowrap">Nom</p>
            <p className="col-span-2 whitespace-nowrap">Prix</p>
            <p className="col-span-2 whitespace-nowrap">Actions</p>
          </div>

          {products.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-1 gap-2 border-b border-[var(--border)]/70 px-3 py-3 last:border-b-0 lg:grid-cols-12 lg:items-center"
            >
              <div className="col-span-2">
              <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-[var(--border)]/80 bg-[var(--muted)]/20">
                {p.cover_image_url ? (
                  <Image
                    src={p.cover_image_url}
                    alt={p.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-[var(--muted-foreground)]">
                    Aucune
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-6 min-w-0">
              <p className="whitespace-nowrap font-medium">{p.name}</p>
              <p className="whitespace-nowrap text-xs text-[var(--muted-foreground)]">
                {p.type} · {p.is_published ? "publié" : "brouillon"}
              </p>
            </div>

            <div className="col-span-2 min-w-[130px] truncate whitespace-nowrap pr-1 text-sm font-medium text-[var(--primary)]">
              {p.pricing_mode === "quote"
                ? "Sur devis"
                : p.pricing_mode === "starting_from"
                  ? `À partir de ${formatPriceXOF(p.base_price)}`
                  : formatPriceXOF(p.base_price)}
            </div>

            <div className="col-span-2 flex flex-nowrap gap-1">
              <Button
                size="sm"
                variant="secondary"
                className="h-9 w-9 p-0"
                aria-label={`Modifier ${p.name}`}
                title="Modifier"
                onClick={() => {
                  setEdit(p);
                  setOpen(true);
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 w-9 p-0 text-red-600 hover:text-red-700"
                aria-label={`Supprimer ${p.name}`}
                title="Supprimer"
                onClick={() => {
                  if (!confirm("Supprimer ce produit ?")) return;
                  startTransition(async () => {
                    const res = await deleteProduct(p.id);
                    if (res.ok) toast.success("Supprimé");
                    else toast.error(res.error);
                  });
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Link
          href={prevHref}
          aria-disabled={page <= 1}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
          title="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
        <Link
          href={nextHref}
          aria-disabled={page >= totalPages}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
          title="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
