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
        box_section_image_url: fd.get("box_section_image_url") || "",
        models_section_banner_url: fd.get("models_section_banner_url") || "",
        trainings_section_banner_url: fd.get("trainings_section_banner_url") || "",
        how_it_works_image_url: fd.get("how_it_works_image_url") || "",
        testimonials_section_image_url: fd.get("testimonials_section_image_url") || "",
        faq_section_image_url: fd.get("faq_section_image_url") || "",
        contact_section_image_url: fd.get("contact_section_image_url") || "",
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
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-10">
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold">Textes & contact</h2>
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
        <div className="space-y-2">
          <Label htmlFor="whatsapp_number">WhatsApp (indicatif sans +)</Label>
          <Input id="whatsapp_number" name="whatsapp_number" defaultValue={row.whatsapp_number ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_email">Email contact</Label>
          <Input id="contact_email" name="contact_email" type="email" defaultValue={row.contact_email ?? ""} />
        </div>
      </div>

      <div className="space-y-6 border-t border-[var(--border)] pt-10">
        <div>
          <h2 className="font-display text-xl font-semibold">Images page d’accueil</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Uploadez vos visuels ou collez une URL. Laisser vide = image par défaut ou contenu produit.
          </p>
        </div>

        <AdminImageField
          name="hero_image_url"
          folder="hero"
          label="Hero — grande image à droite du titre"
          defaultUrl={row.hero_image_url}
        />
        <AdminImageField
          name="models_section_banner_url"
          folder="site"
          label="Galerie modèles — bannière sous le titre (optionnel)"
          defaultUrl={row.models_section_banner_url}
        />
        <AdminImageField
          name="how_it_works_image_url"
          folder="site"
          label="Comment commander — illustration (côté gauche sur grand écran)"
          defaultUrl={row.how_it_works_image_url}
        />
        <AdminImageField
          name="box_section_image_url"
          folder="site"
          label="Section box cadeaux — visuel principal (sinon 1er produit box)"
          defaultUrl={row.box_section_image_url}
        />
        <AdminImageField
          name="trainings_section_banner_url"
          folder="site"
          label="Formations — bannière sous le titre"
          defaultUrl={row.trainings_section_banner_url}
        />
        <AdminImageField
          name="testimonials_section_image_url"
          folder="site"
          label="Témoignages — image d’ambiance au-dessus des cartes"
          defaultUrl={row.testimonials_section_image_url}
        />
        <AdminImageField
          name="faq_section_image_url"
          folder="site"
          label="FAQ — bandeau sous le titre"
          defaultUrl={row.faq_section_image_url}
        />
        <AdminImageField
          name="contact_section_image_url"
          folder="site"
          label="Contact — image au-dessus du bloc (dans la carte colorée)"
          defaultUrl={row.contact_section_image_url}
        />
      </div>

      <div className="space-y-4 border-t border-[var(--border)] pt-10">
        <h2 className="font-display text-xl font-semibold">SEO</h2>
        <div className="space-y-2">
          <Label htmlFor="seo_title">SEO title</Label>
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
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
