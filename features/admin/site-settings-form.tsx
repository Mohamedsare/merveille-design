"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateSiteSettings } from "@/actions/admin-settings";
import { AdminImageField } from "@/components/admin/admin-image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettings } from "@/types/database";

export function SiteSettingsForm({ row }: { row: SiteSettings }) {
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateSiteSettings(row.id, {
        site_name: fd.get("site_name"),
        hero_title: fd.get("hero_title"),
        hero_subtitle: fd.get("hero_subtitle"),
        hero_image_url: fd.get("hero_image_url") || "",
        whatsapp_number: fd.get("whatsapp_number"),
        contact_email: fd.get("contact_email"),
        seo_title: fd.get("seo_title"),
        seo_description: fd.get("seo_description"),
        seo_keywords: fd.get("seo_keywords"),
      });
      if (res.ok) toast.success("Paramètres enregistrés");
      else toast.error("error" in res ? res.error : "Erreur");
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="site_name">Nom du site</Label>
        <Input id="site_name" name="site_name" defaultValue={row.site_name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hero_title">Titre hero</Label>
        <Input id="hero_title" name="hero_title" defaultValue={row.hero_title ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="hero_subtitle">Sous-titre hero</Label>
        <Textarea id="hero_subtitle" name="hero_subtitle" defaultValue={row.hero_subtitle ?? ""} rows={3} />
      </div>
      <AdminImageField
        name="hero_image_url"
        folder="hero"
        label="Image principale du hero"
        defaultUrl={row.hero_image_url}
      />
      <div className="space-y-2">
        <Label htmlFor="whatsapp_number">WhatsApp (indicatif sans +)</Label>
        <Input id="whatsapp_number" name="whatsapp_number" defaultValue={row.whatsapp_number ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact_email">Email contact</Label>
        <Input id="contact_email" name="contact_email" type="email" defaultValue={row.contact_email ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seo_title">SEO title (Burkina / local)</Label>
        <Input id="seo_title" name="seo_title" defaultValue={row.seo_title ?? ""} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seo_description">Meta description</Label>
        <Textarea id="seo_description" name="seo_description" defaultValue={row.seo_description ?? ""} rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="seo_keywords">Mots-clés</Label>
        <Input id="seo_keywords" name="seo_keywords" defaultValue={row.seo_keywords ?? ""} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
