"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { saveLifestyleGallery } from "@/actions/admin-lifestyle-gallery";
import { uploadAdminMedia } from "@/actions/admin-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LifestyleGalleryAdmin({ settingsId, initialUrls }: { settingsId: string; initialUrls: string[] }) {
  const router = useRouter();
  const [urls, setUrls] = useState<string[]>(initialUrls.length ? initialUrls : []);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrls(initialUrls.length ? initialUrls : []);
  }, [initialUrls]);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const persist = useCallback(
    (next: string[]) => {
      startTransition(async () => {
        const res = await saveLifestyleGallery({ settingsId, urls: next });
        if (res.ok) {
          toast.success("Galerie lifestyle enregistrée");
          const cleaned = next.map((s) => s.trim()).filter(Boolean);
          setUrls(cleaned);
          refresh();
        } else toast.error(res.error);
      });
    },
    [settingsId, refresh],
  );

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", "site");
    const up = await uploadAdminMedia(fd);
    setUploading(false);
    if (!up.ok) {
      toast.error(up.error);
      return;
    }
    const next = [...urls, up.url];
    persist(next);
  };

  const addUrlRow = () => {
    setUrls((prev) => [...prev, ""]);
  };

  const updateUrl = (index: number, value: string) => {
    setUrls((prev) => prev.map((u, i) => (i === index ? value : u)));
  };

  const removeAt = (index: number) => {
    const next = urls.filter((_, i) => i !== index);
    persist(next);
  };

  const move = (index: number, dir: "up" | "down") => {
    const j = dir === "up" ? index - 1 : index + 1;
    if (j < 0 || j >= urls.length) return;
    const next = [...urls];
    [next[index], next[j]] = [next[j], next[index]];
    persist(next);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <Label>Ajouter des photos</Label>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Ajoutez autant d&apos;images que vous voulez. Elles s&apos;affichent sur la page d&apos;accueil dans la section « Galerie lifestyle ».
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={onFile}
          />
          <Button type="button" variant="secondary" disabled={uploading || pending} onClick={() => fileRef.current?.click()}>
            {uploading ? "Envoi…" : "Téléverser une image"}
          </Button>
          <Button type="button" variant="outline" disabled={pending} onClick={addUrlRow}>
            <Plus className="mr-2 h-4 w-4" />
            Coller une URL
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="font-display text-lg font-semibold">Photos ({urls.length})</h2>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Glissez l&apos;ordre avec les flèches. Les lignes vides sont ignorées à l&apos;enregistrement.
        </p>
        <ul className="mt-4 space-y-3">
          {urls.length === 0 ? (
            <li className="rounded-xl border border-dashed border-[var(--border)] py-10 text-center text-sm text-[var(--muted-foreground)]">
              Aucune photo pour l&apos;instant. Téléversez ou ajoutez une URL.
            </li>
          ) : (
            urls.map((url, index) => (
              <li
                key={`${index}-${url.slice(0, 20)}`}
                className="flex flex-col gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 sm:flex-row sm:items-center"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--muted)]/30">
                  {url.trim() ? (
                    <Image src={url.trim()} alt="" fill className="object-cover" sizes="96px" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-[var(--muted-foreground)]">Aperçu</div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <Input
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder="https://…"
                    className="text-sm"
                  />
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button type="button" size="icon" variant="ghost" className="h-9 w-9" title="Monter" onClick={() => move(index, "up")} disabled={pending || index === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9"
                    title="Descendre"
                    onClick={() => move(index, "down")}
                    disabled={pending || index === urls.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-9 w-9 text-rose-600" title="Supprimer" onClick={() => removeAt(index)} disabled={pending}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))
          )}
        </ul>
        <Button type="button" className="mt-4 w-full sm:w-auto" variant="secondary" disabled={pending} onClick={() => persist(urls)}>
          Enregistrer la galerie
        </Button>
      </div>
    </div>
  );
}
