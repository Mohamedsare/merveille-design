"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteContactMessage } from "@/actions/admin-contacts";
import { Button } from "@/components/ui/button";
import { orderStatusLabelFr } from "@/lib/admin-fr";

export type ContactMessageRow = {
  id: string;
  name: string;
  phone: string;
  message: string;
  status: string;
  created_at: string;
};

export function ContactMessagesList({ messages }: { messages: ContactMessageRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function remove(id: string) {
    if (!window.confirm("Supprimer définitivement ce message ? Cette action est irréversible.")) return;
    startTransition(async () => {
      const res = await deleteContactMessage({ id });
      if (res.ok) {
        toast.success("Message supprimé");
        router.refresh();
      } else toast.error(res.error ?? "Erreur");
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <ul className="divide-y divide-[var(--border)]">
        {messages.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
            Aucun message pour le moment.
          </li>
        ) : (
          messages.map((m) => (
            <li key={m.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="font-medium">{m.name}</p>
                  <p className="text-sm text-[var(--muted-foreground)]">{m.phone}</p>
                  <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs">
                    {orderStatusLabelFr(m.status)}
                  </span>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {new Date(m.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <p className="text-sm">{m.message}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700"
                disabled={pending}
                aria-label={`Supprimer le message de ${m.name}`}
                onClick={() => remove(m.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
