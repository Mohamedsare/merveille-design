"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteTraining, upsertTraining } from "@/actions/admin-trainings";
import { AdminImageField } from "@/components/admin/admin-image-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPriceXOF } from "@/lib/utils";
import type { Training } from "@/types/database";

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type TrainingsAdminProps = {
  trainings: Training[];
  q: string;
  published: string;
  page: number;
  totalPages: number;
  prevHref: string;
  nextHref: string;
};

export function TrainingsAdmin({ trainings, q, published, page, totalPages, prevHref, nextHref }: TrainingsAdminProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Training | null>(null);
  const [search, setSearch] = useState(q);
  const [statusFilter, setStatusFilter] = useState(published);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setSearch(q);
  }, [q]);

  useEffect(() => {
    setStatusFilter(published);
  }, [published]);

  const queryBase = useMemo(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("page");
    return params;
  }, [searchParams]);

  function applyFilters(next: { q?: string; published?: string }) {
    const params = new URLSearchParams(queryBase.toString());
    const nextQ = (next.q ?? search).trim();
    const nextPublished = next.published ?? statusFilter;
    if (nextQ) params.set("q", nextQ);
    else params.delete("q");
    if (nextPublished && nextPublished !== "all") params.set("published", nextPublished);
    else params.delete("published");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  useEffect(() => {
    const t = setTimeout(() => applyFilters({ q: search }), 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "");
    const raw = {
      title,
      slug: toSlug(title),
      short_description: fd.get("short_description") || "",
      description: fd.get("description") || "",
      price: fd.get("price") ? Number(fd.get("price")) : null,
      pricing_mode: fd.get("pricing_mode"),
      duration: fd.get("duration") || "",
      level: fd.get("level") || "",
      mode: fd.get("mode") || "presentiel",
      is_published: fd.get("is_published") === "on",
      cover_image_url: fd.get("cover_image_url") || "",
      display_order: fd.get("display_order") ? Number(fd.get("display_order")) : 0,
    };
    startTransition(async () => {
      const res = await upsertTraining(edit?.id ?? null, raw);
      if (res.ok) {
        toast.success(edit ? "Formation mise à jour" : "Formation créée");
        setOpen(false);
        setEdit(null);
      } else toast.error("error" in res ? res.error : "Erreur");
    });
  }

  return (
    <div className="space-y-4 lg:space-y-5">
      <div className="relative rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 lg:p-4">
        <div className="grid grid-cols-1 gap-2 pr-0 sm:pr-16 lg:grid-cols-[minmax(0,1fr)_12rem] lg:gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une formation..."
            className="h-11"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              const value = e.target.value;
              setStatusFilter(value);
              applyFilters({ published: value });
            }}
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiées</option>
            <option value="draft">Brouillons</option>
          </select>
        </div>
        <Button
          size="icon"
          className="absolute right-3 top-3 h-11 w-11 rounded-full lg:right-4 lg:top-4"
          title="Créer une formation"
          aria-label="Créer une formation"
          onClick={() => {
            setEdit(null);
            setOpen(true);
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <Button
        size="icon"
        className="fixed bottom-5 right-5 z-20 h-14 w-14 rounded-full shadow-lg lg:hidden"
        title="Créer une formation"
        aria-label="Créer une formation"
        onClick={() => {
          setEdit(null);
          setOpen(true);
        }}
      >
        <Plus className="h-7 w-7" />
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
            <DialogTitle>{edit ? "Modifier" : "Créer"} une formation</DialogTitle>
          </DialogHeader>
          <form key={edit?.id ?? "new"} className="space-y-3 pt-2" onSubmit={onSubmit}>
            <div className="space-y-1">
              <Label htmlFor="title">Titre</Label>
              <Input id="title" name="title" defaultValue={edit?.title} required />
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
                <Label htmlFor="price">Prix</Label>
                <Input id="price" name="price" type="number" defaultValue={edit?.price ?? ""} />
              </div>
              <div className="space-y-1">
                <Label>Mode</Label>
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
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="duration">Durée</Label>
                <Input id="duration" name="duration" defaultValue={edit?.duration ?? ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="level">Niveau</Label>
                <Input id="level" name="level" defaultValue={edit?.level ?? ""} />
              </div>
            </div>
            <AdminImageField
              key={`tcover-${edit?.id ?? "new"}`}
              name="cover_image_url"
              folder="trainings"
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
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="is_published" defaultChecked={edit?.is_published} />
              Publié
            </label>
            <Button type="submit" className="w-full" disabled={pending}>
              Enregistrer
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <div className="hidden lg:grid lg:grid-cols-12 lg:gap-1 lg:px-3 lg:py-2">
          <p className="col-span-2 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Image</p>
          <p className="col-span-6 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Nom</p>
          <p className="col-span-2 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Prix</p>
          <p className="col-span-2 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">Actions</p>
        </div>
        <ul className="divide-y divide-[var(--border)]">
          {trainings.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">Aucune formation trouvée.</li>
          ) : (
            trainings.map((t) => (
              <li key={t.id} className="px-3 py-3">
                <div className="grid grid-cols-1 gap-2 lg:grid-cols-12 lg:items-center lg:gap-1">
                  <div className="lg:col-span-2">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--muted)]">
                      {t.cover_image_url ? (
                        <Image src={t.cover_image_url} alt={t.title} fill className="object-cover" sizes="48px" />
                      ) : null}
                    </div>
                  </div>
                  <div className="min-w-0 lg:col-span-6">
                    <p className="truncate whitespace-nowrap text-sm font-medium">{t.title}</p>
                    <p className="truncate whitespace-nowrap text-xs text-[var(--muted-foreground)]">
                      {t.is_published ? "publiée" : "brouillon"} · {t.slug}
                    </p>
                  </div>
                  <p className="truncate whitespace-nowrap text-sm lg:col-span-2">
                    {t.price ? formatPriceXOF(t.price) : "Sur devis"}
                  </p>
                  <div className="flex items-center gap-1 lg:col-span-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      title="Modifier"
                      aria-label={`Modifier ${t.title}`}
                      onClick={() => {
                        setEdit(t);
                        setOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      title="Supprimer"
                      aria-label={`Supprimer ${t.title}`}
                      onClick={() => {
                        if (!confirm("Supprimer ?")) return;
                        startTransition(async () => {
                          const res = await deleteTraining(t.id);
                          if (res.ok) toast.success("Supprimé");
                          else toast.error(res.error);
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2">
        <p className="text-xs text-[var(--muted-foreground)]">
          Page {page} / {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" disabled={page <= 1} asChild>
            <Link href={prevHref} aria-label="Page précédente">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="icon" variant="outline" disabled={page >= totalPages} asChild>
            <Link href={nextHref} aria-label="Page suivante">
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
