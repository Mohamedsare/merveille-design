import Link from "next/link";
import { MediaEnhancePanel } from "@/features/admin/media-enhance-panel";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const PAGE_SIZE = 30;

function positiveInt(raw: string | undefined, fallback: number) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = positiveInt(params.page, 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const supabase = await createServerSupabaseClient();
  let rows: {
    id: string;
    image_url: string;
    enhancement_status: string;
    product_id: string;
    products: { name: string } | null;
  }[] = [];
  let total = 0;

  if (supabase) {
    const { data: images, count } = await supabase
      .from("product_images")
      .select("id, image_url, enhancement_status, product_id, products(name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);
    rows =
      (images ?? []).map((img) => ({
        id: img.id as string,
        image_url: img.image_url as string,
        enhancement_status: img.enhancement_status as string,
        product_id: img.product_id as string,
        products: {
          name:
            ((img as { products?: { name?: string } | null }).products?.name ?? "Produit") as string,
        },
      })) ?? [];
    total = count ?? 0;
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Médias & amélioration</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Pipeline Sharp subtil. Bucket Supabase <code className="rounded bg-[var(--muted)] px-1">media</code>{" "}
          requis pour l’upload des versions améliorées.
        </p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {total} image(s) · page {page}/{totalPages}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/dashboard/media?page=${prevPage}`}
          aria-disabled={page <= 1}
          className={`rounded-lg border px-3 py-1.5 text-sm ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
        >
          Précédent
        </Link>
        <Link
          href={`/admin/dashboard/media?page=${nextPage}`}
          aria-disabled={page >= totalPages}
          className={`rounded-lg border px-3 py-1.5 text-sm ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
        >
          Suivant
        </Link>
      </div>
      <MediaEnhancePanel rows={rows} />
    </div>
  );
}
