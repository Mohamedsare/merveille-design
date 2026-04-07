import { BellRing, ClipboardList, GraduationCap, MessageSquare } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { orderStatusLabelFr } from "@/lib/admin-fr";

type OrderNotif = {
  id: string;
  customer_name: string;
  order_type: string;
  status: string;
  created_at: string;
};

type ContactNotif = {
  id: string;
  name: string;
  status: string;
  created_at: string;
};

export default async function AdminNotificationsPage() {
  const supabase = await createServerSupabaseClient();
  let newOrders: OrderNotif[] = [];
  let trainingBookings: OrderNotif[] = [];
  let contactMessages: ContactNotif[] = [];

  if (supabase) {
    const { data: orderRows } = await supabase
      .from("orders")
      .select("id,customer_name,order_type,status,created_at")
      .in("status", ["new", "pending"])
      .neq("order_type", "training")
      .order("created_at", { ascending: false })
      .limit(20);
    newOrders = (orderRows as OrderNotif[]) ?? [];

    const { data: trainingRows } = await supabase
      .from("orders")
      .select("id,customer_name,order_type,status,created_at")
      .eq("order_type", "training")
      .in("status", ["training_received", "training_pending"])
      .order("created_at", { ascending: false })
      .limit(20);
    trainingBookings = (trainingRows as OrderNotif[]) ?? [];

    const { data: contactRows } = await supabase
      .from("contact_messages")
      .select("id,name,status,created_at")
      .eq("status", "new")
      .order("created_at", { ascending: false })
      .limit(30);
    contactMessages = (contactRows as ContactNotif[]) ?? [];
  }

  const total = newOrders.length + trainingBookings.length + contactMessages.length;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--muted)]/40">
          <BellRing className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Vous avez {total} notification(s) à traiter rapidement.
          </p>
        </div>
      </div>

      <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-[var(--primary)]" />
          <h2 className="font-display text-lg font-semibold">Nouvelles commandes</h2>
        </div>
        {newOrders.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">Aucune nouvelle commande en attente.</p>
        ) : (
          <ul className="space-y-2">
            {newOrders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--muted)]/35 px-3 py-2">
                <p className="text-sm font-medium">{o.customer_name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {orderStatusLabelFr(o.status)} · {new Date(o.created_at).toLocaleString("fr-FR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-[var(--primary)]" />
          <h2 className="font-display text-lg font-semibold">Réservations formations</h2>
        </div>
        {trainingBookings.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">Aucune réservation nouvelle.</p>
        ) : (
          <ul className="space-y-2">
            {trainingBookings.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--muted)]/35 px-3 py-2">
                <p className="text-sm font-medium">{o.customer_name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {orderStatusLabelFr(o.status)} · {new Date(o.created_at).toLocaleString("fr-FR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[var(--primary)]" />
          <h2 className="font-display text-lg font-semibold">Messages contact</h2>
        </div>
        {contactMessages.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">Aucun nouveau message contact.</p>
        ) : (
          <ul className="space-y-2">
            {contactMessages.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[var(--muted)]/35 px-3 py-2">
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {orderStatusLabelFr(m.status)} · {new Date(m.created_at).toLocaleString("fr-FR")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
