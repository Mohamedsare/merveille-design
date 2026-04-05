import { TrainingsAdmin } from "@/features/admin/trainings-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Training } from "@/types/database";

export default async function AdminTrainingsPage() {
  const supabase = await createServerSupabaseClient();
  let trainings: Training[] = [];
  if (supabase) {
    const { data } = await supabase.from("trainings").select("*").order("display_order");
    trainings = (data as Training[]) ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Formations</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Ateliers présentiels et demandes liées.</p>
      </div>
      <TrainingsAdmin trainings={trainings} />
    </div>
  );
}
