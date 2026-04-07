import Link from "next/link";
import { ProductsAdmin } from "@/features/admin/products-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/types/database";

const PAGE_SIZE = 24;

function positiveInt(raw: string | undefined, fallback: number) {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = positiveInt(params.page, 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const supabase = await createServerSupabaseClient();
  let products: Product[] = [];
  let categories: Category[] = [];
  let total = 0;
  if (supabase) {
    const [{ data: p, count }, { data: c }] = await Promise.all([
      supabase
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
        .order("display_order")
        .range(from, to),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    products = (p as Product[]) ?? [];
    categories = (c as Category[]) ?? [];
    total = count ?? 0;
  }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Produits & box</h1>
        <p className="text-sm text-[var(--muted-foreground)]">CRUD, publication, visibilité vitrine.</p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {total} produit(s) · page {page}/{totalPages}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/dashboard/products?page=${prevPage}`}
          aria-disabled={page <= 1}
          className={`rounded-lg border px-3 py-1.5 text-sm ${page <= 1 ? "pointer-events-none opacity-40" : ""}`}
        >
          Précédent
        </Link>
        <Link
          href={`/admin/dashboard/products?page=${nextPage}`}
          aria-disabled={page >= totalPages}
          className={`rounded-lg border px-3 py-1.5 text-sm ${page >= totalPages ? "pointer-events-none opacity-40" : ""}`}
        >
          Suivant
        </Link>
      </div>
      <ProductsAdmin products={products} categories={categories} />
    </div>
  );
}
