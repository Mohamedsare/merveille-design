import { ProductsAdmin } from "@/features/admin/products-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/types/database";

const PAGE_SIZE = 20;

function positiveInt(raw: string | undefined, fallback: number) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

function keep(params: {
  q?: string;
  type?: string;
  published?: string;
  page?: number;
}) {
  const usp = new URLSearchParams();
  if (params.q) usp.set("q", params.q);
  if (params.type && params.type !== "all") usp.set("type", params.type);
  if (params.published && params.published !== "all") usp.set("published", params.published);
  if (params.page && params.page > 1) usp.set("page", String(params.page));
  const out = usp.toString();
  return out ? `?${out}` : "";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; type?: string; published?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const type = params.type ?? "all";
  const published = params.published ?? "all";
  const page = positiveInt(params.page, 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const supabase = await createServerSupabaseClient();
  let products: Product[] = [];
  let categories: Category[] = [];
  let total = 0;
  if (supabase) {
    let productsQuery = supabase
      .from("products")
      .select(
        `*,
          product_images (
            id,
            product_id,
            image_url,
            original_image_url,
            enhanced_image_url,
            enhancement_status,
            sort_order,
            created_at
          )`,
        { count: "exact" }
      )
      .order("display_order");

    if (q) {
      const like = `%${q.replaceAll("%", "")}%`;
      productsQuery = productsQuery.or(`name.ilike.${like},slug.ilike.${like}`);
    }
    if (type === "bag" || type === "box") {
      productsQuery = productsQuery.eq("type", type);
    }
    if (published === "published") {
      productsQuery = productsQuery.eq("is_published", true);
    } else if (published === "draft") {
      productsQuery = productsQuery.eq("is_published", false);
    }

    const [{ data: p, count }, { data: c }] = await Promise.all([
      productsQuery.range(from, to),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    products = (p as Product[]) ?? [];
    categories = (c as Category[]) ?? [];
    total = count ?? 0;
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);
  const prevHref = `/admin/dashboard/products${keep({ q, type, published, page: prevPage })}`;
  const nextHref = `/admin/dashboard/products${keep({ q, type, published, page: nextPage })}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Produits & box</h1>
        <p className="text-sm text-[var(--muted-foreground)]">CRUD, publication, visibilité vitrine.</p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {total} produit(s) · page {page}/{totalPages}
        </p>
      </div>
      <ProductsAdmin
        products={products}
        categories={categories}
        q={q}
        type={type}
        published={published}
        page={page}
        totalPages={totalPages}
        prevHref={prevHref}
        nextHref={nextHref}
      />
    </div>
  );
}
