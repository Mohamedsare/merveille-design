import { LifestyleGalleryAdmin } from "@/features/admin/lifestyle-gallery-admin";
import { demoSettings } from "@/lib/demo-data";
import { parseLifestyleGalleryUrls } from "@/lib/lifestyle-gallery";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/types/database";

export default async function AdminLifestyleGalleryPage() {
  const supabase = await createServerSupabaseClient();
  let row: SiteSettings = demoSettings;
  if (supabase) {
    const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    if (data) row = data as SiteSettings;
  }

  const urls = parseLifestyleGalleryUrls(row);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Galerie lifestyle</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Gérez toutes les photos de la section « Galerie lifestyle » sur la page d&apos;accueil. Ajoutez autant d&apos;images que nécessaire.
        </p>
      </div>
      {row.id === "demo" ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4 text-sm text-[var(--muted-foreground)]">
          Aucune ligne <code className="rounded bg-[var(--muted)] px-1">site_settings</code> en base. Exécutez la migration et le seed, puis rechargez.
        </p>
      ) : (
        <LifestyleGalleryAdmin settingsId={row.id} initialUrls={urls} />
      )}
    </div>
  );
}
