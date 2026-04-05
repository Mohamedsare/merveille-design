import { ExportOrdersButton } from "@/features/admin/export-orders-button";
import { OrdersTable } from "@/features/admin/orders-table";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Order } from "@/types/database";

export default async function AdminOrdersPage() {
  const supabase = await createServerSupabaseClient();
  let orders: Order[] = [];
  if (supabase) {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    orders = (data as Order[]) ?? [];
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Commandes</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Mettre à jour les statuts et exporter en CSV.
          </p>
        </div>
        <ExportOrdersButton />
      </div>
      <OrdersTable orders={orders} />
    </div>
  );
}
