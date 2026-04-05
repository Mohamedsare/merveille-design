import { ProductsAdmin } from "@/features/admin/products-admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Category, Product } from "@/types/database";

export default async function AdminProductsPage() {
  const supabase = await createServerSupabaseClient();
  let products: Product[] = [];
  let categories: Category[] = [];
  if (supabase) {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("products").select("*").order("display_order"),
      supabase.from("categories").select("*").order("sort_order"),
    ]);
    products = (p as Product[]) ?? [];
    categories = (c as Category[]) ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Produits & box</h1>
        <p className="text-sm text-[var(--muted-foreground)]">CRUD, publication, visibilité vitrine.</p>
      </div>
      <ProductsAdmin products={products} categories={categories} />
    </div>
  );
}
