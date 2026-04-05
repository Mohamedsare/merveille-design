"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteTraining, upsertTraining } from "@/actions/admin-trainings";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Training } from "@/types/database";

export function TrainingsAdmin({ trainings }: { trainings: Training[] }) {
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Training | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      title: fd.get("title"),
      slug: fd.get("slug"),
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEdit(null);
            setOpen(true);
          }}
        >
          Nouvelle formation
        </Button>
      </div>

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
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={edit?.slug} required />
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
            <div className="space-y-1">
              <Label htmlFor="cover_image_url">URL image</Label>
              <Input
                id="cover_image_url"
                name="cover_image_url"
                type="url"
                defaultValue={edit?.cover_image_url ?? ""}
              />
            </div>
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

      <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--card)]">
        {trainings.map((t) => (
          <li key={t.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{t.title}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{t.is_published ? "publié" : "brouillon"}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setEdit(t);
                  setOpen(true);
                }}
              >
                Modifier
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (!confirm("Supprimer ?")) return;
                  startTransition(async () => {
                    const res = await deleteTraining(t.id);
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
