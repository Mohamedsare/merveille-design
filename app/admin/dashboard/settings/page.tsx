import { SiteSettingsForm } from "@/features/admin/site-settings-form";
import { demoSettings } from "@/lib/demo-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/types/database";

export default async function AdminSettingsPage() {
  const supabase = await createServerSupabaseClient();
  let row: SiteSettings = demoSettings;
  if (supabase) {
    const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
    if (data) row = data as SiteSettings;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Paramètres</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Textes clés, SEO Burkina Faso, contact.</p>
      </div>
      {row.id === "demo" ? (
        <p className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-4 text-sm text-[var(--muted-foreground)]">
          Aucune ligne <code className="rounded bg-[var(--muted)] px-1">site_settings</code> en base. Exécutez{" "}
          <code className="rounded bg-[var(--muted)] px-1">supabase/seed.sql</code> après la migration, puis
          rechargez cette page.
        </p>
      ) : (
        <SiteSettingsForm row={row} />
      )}
    </div>
  );
}
