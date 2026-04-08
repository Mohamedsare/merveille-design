"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { uploadAdminMedia, type AdminMediaFolder } from "@/actions/admin-media";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  folder: AdminMediaFolder;
  label?: string;
  defaultUrl?: string | null;
  className?: string;
};

export function AdminImageField({ name, folder, label = "Image", defaultUrl, className }: Props) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrl(defaultUrl ?? "");
  }, [defaultUrl]);

  const onFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      setUploading(true);
      const fd = new FormData();
      fd.set("file", file);
      fd.set("folder", folder);
      const res = await uploadAdminMedia(fd);
      setUploading(false);
      if (res.ok) {
        setUrl(res.url);
        toast.success("Image envoyée");
      } else {
        toast.error(res.error);
      }
    },
    [folder]
  );

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]/30">
          {url ? (
            <Image src={url} alt="" fill className="object-cover" sizes="160px" unoptimized />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-[var(--muted-foreground)]">
              Aperçu
            </div>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
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
            className="w-full sm:w-auto"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? "Envoi…" : "Choisir une image"}
          </Button>
          <p className="text-xs text-[var(--muted-foreground)]">JPEG, PNG, WebP ou GIF — max 5 Mo</p>
        </div>
      </div>
    </div>
  );
}
