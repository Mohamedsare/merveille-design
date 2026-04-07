import { TrainingsAdmin } from "@/features/admin/trainings-admin";
import { TrainingBookingsAdmin } from "@/features/admin/training-bookings-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Order, Training } from "@/types/database";

const PAGE_SIZE = 20;

function positiveInt(raw: string | undefined, fallback: number) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function keep(params: { q?: string; published?: string; page?: number }) {
  const usp = new URLSearchParams();
  if (params.q) usp.set("q", params.q);
  if (params.published && params.published !== "all") usp.set("published", params.published);
  if (params.page && params.page > 1) usp.set("page", String(params.page));
  const out = usp.toString();
  return out ? `?${out}` : "";
}

export default async function AdminTrainingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; published?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const published = params.published ?? "all";
  const page = positiveInt(params.page, 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const supabase = await createServerSupabaseClient();
  let trainings: Training[] = [];
  let bookings: Order[] = [];
  const trainingNamesById: Record<string, string> = {};
  const trainingThumbsById: Record<string, string> = {};
  let total = 0;
  if (supabase) {
    let query = supabase.from("trainings").select("*", { count: "exact" }).order("display_order");
    if (q) {
      const like = `%${q.replaceAll("%", "")}%`;
      query = query.or(`title.ilike.${like},slug.ilike.${like}`);
    }
    if (published === "published") query = query.eq("is_published", true);
    if (published === "draft") query = query.eq("is_published", false);
    const { data, count } = await query.range(from, to);
    trainings = (data as Training[]) ?? [];
    total = count ?? 0;

    const { data: bookingRows } = await supabase
      .from("orders")
      .select("*")
      .eq("order_type", "training")
      .order("created_at", { ascending: false })
      .limit(120);
    bookings = (bookingRows as Order[]) ?? [];

    const trainingIds = Array.from(
      new Set(bookings.map((o) => o.training_id).filter((id): id is string => Boolean(id))),
    );
    if (trainingIds.length > 0) {
      const { data: linkedTrainings } = await supabase
        .from("trainings")
        .select("id,title,cover_image_url")
        .in("id", trainingIds);
      for (const t of linkedTrainings ?? []) {
        if (t.id && t.title) trainingNamesById[t.id] = t.title;
        if (t.id && t.cover_image_url) trainingThumbsById[t.id] = t.cover_image_url;
      }
    }
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);
  const prevHref = `/admin/dashboard/trainings${keep({ q, published, page: prevPage })}`;
  const nextHref = `/admin/dashboard/trainings${keep({ q, published, page: nextPage })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Formations</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Ateliers présentiels et demandes liées.</p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {total} formation(s) · page {page}/{totalPages}
        </p>
      </div>
      <TrainingsAdmin
        trainings={trainings}
        q={q}
        published={published}
        page={page}
        totalPages={totalPages}
        prevHref={prevHref}
        nextHref={nextHref}
      />
      <TrainingBookingsAdmin
        bookings={bookings}
        trainingNamesById={trainingNamesById}
        trainingThumbsById={trainingThumbsById}
      />
    </div>
  );
}
