import { ExportOrdersButton } from "@/features/admin/export-orders-button";
import { OrdersTable } from "@/features/admin/orders-table";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Order } from "@/types/database";

function isLegacyContactRow(order: Order) {
  return (
    order.order_type === "custom_bag" &&
    !order.product_id &&
    !order.training_id &&
    !order.customization_request &&
    !order.budget &&
    !order.fabric_color_notes &&
    !order.inspiration_image_url
  );
}

export default async function AdminOrdersPage() {
  const supabase = await createServerSupabaseClient();
  let orders: Order[] = [];
  const productNamesById: Record<string, string> = {};
  const trainingNamesById: Record<string, string> = {};
  const productThumbsById: Record<string, string> = {};
  const trainingThumbsById: Record<string, string> = {};
  if (supabase) {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    orders = ((data as Order[]) ?? []).filter((o) => !isLegacyContactRow(o));

    const productIds = Array.from(new Set(orders.map((o) => o.product_id).filter((id): id is string => Boolean(id))));
    const trainingIds = Array.from(
      new Set(orders.map((o) => o.training_id).filter((id): id is string => Boolean(id))),
    );

    if (productIds.length > 0) {
      const { data: products } = await supabase.from("products").select("id,name,cover_image_url").in("id", productIds);
      for (const p of products ?? []) {
        if (p.id && p.name) productNamesById[p.id] = p.name;
        if (p.id && p.cover_image_url) productThumbsById[p.id] = p.cover_image_url;
      }
    }

    if (trainingIds.length > 0) {
      const { data: trainings } = await supabase.from("trainings").select("id,title,cover_image_url").in("id", trainingIds);
      for (const t of trainings ?? []) {
        if (t.id && t.title) trainingNamesById[t.id] = t.title;
        if (t.id && t.cover_image_url) trainingThumbsById[t.id] = t.cover_image_url;
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Commandes</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Pilotez vos commandes facilement: suivi des statuts, tri visuel et export CSV.
          </p>
        </div>
        <ExportOrdersButton />
      </div>
      <OrdersTable
        orders={orders}
        productNamesById={productNamesById}
        trainingNamesById={trainingNamesById}
        productThumbsById={productThumbsById}
        trainingThumbsById={trainingThumbsById}
      />
    </div>
  );
}
