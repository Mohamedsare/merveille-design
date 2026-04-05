import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAdminOverview() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      ordersTotal: 0,
      ordersNew: 0,
      ordersInProgress: 0,
      ordersDelivered: 0,
      productsPublished: 0,
      trainingsPublished: 0,
      recentOrders: [] as { id: string; customer_name: string; status: string; created_at: string }[],
      ordersByDay: [] as { date: string; count: number }[],
      categorySplit: [] as { name: string; value: number }[],
      eventsLast7: [] as { date: string; count: number }[],
    };
  }

  const { count: ordersTotal } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: ordersNew } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "new");

  const { count: ordersInProgress } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "confirmed", "in_production", "ready"]);

  const { count: ordersDelivered } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "delivered");

  const { count: productsPublished } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  const { count: trainingsPublished } = await supabase
    .from("trainings")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, customer_name, status, created_at")
    .order("created_at", { ascending: false })
    .limit(8);

  const since = new Date();
  since.setDate(since.getDate() - 14);
  const { data: ordersRaw } = await supabase
    .from("orders")
    .select("created_at, order_type")
    .gte("created_at", since.toISOString());

  const dayMap = new Map<string, number>();
  for (const row of ordersRaw ?? []) {
    const d = (row.created_at as string).slice(0, 10);
    dayMap.set(d, (dayMap.get(d) ?? 0) + 1);
  }
  const ordersByDay = Array.from(dayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const typeCount: Record<string, number> = {};
  for (const row of ordersRaw ?? []) {
    const t = (row as { order_type: string }).order_type;
    typeCount[t] = (typeCount[t] ?? 0) + 1;
  }
  const categorySplit = Object.entries(typeCount).map(([name, value]) => ({ name, value }));

  const { data: eventsRaw } = await supabase
    .from("visitor_events")
    .select("created_at")
    .gte("created_at", since.toISOString());

  const evMap = new Map<string, number>();
  for (const row of eventsRaw ?? []) {
    const d = (row.created_at as string).slice(0, 10);
    evMap.set(d, (evMap.get(d) ?? 0) + 1);
  }
  const eventsLast7 = Array.from(evMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    ordersTotal: ordersTotal ?? 0,
    ordersNew: ordersNew ?? 0,
    ordersInProgress: ordersInProgress ?? 0,
    ordersDelivered: ordersDelivered ?? 0,
    productsPublished: productsPublished ?? 0,
    trainingsPublished: trainingsPublished ?? 0,
    recentOrders: recentOrders ?? [],
    ordersByDay,
    categorySplit,
    eventsLast7,
  };
}
