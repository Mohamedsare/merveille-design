import { createServerSupabaseClient } from "@/lib/supabase/server";
import { orderStatusLabelFr } from "@/lib/admin-fr";

type ContactMessageRow = {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
};

export default async function AdminContactsPage() {
  const supabase = await createServerSupabaseClient();
  let messages: ContactMessageRow[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("contact_messages")
      .select("id,name,phone,message,status,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    messages = (data as ContactMessageRow[]) ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Messages contact</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Messages envoyés via le formulaire de contact du site.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <ul className="divide-y divide-[var(--border)]">
          {messages.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">Aucun message pour le moment.</li>
          ) : (
            messages.map((m) => (
              <li key={m.id} className="space-y-2 px-4 py-3">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{m.phone}</p>
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs">{orderStatusLabelFr(m.status)}</span>
                  <p className="text-xs text-[var(--muted-foreground)]">{new Date(m.created_at).toLocaleString("fr-FR")}</p>
                </div>
                <p className="text-sm">{m.message}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
