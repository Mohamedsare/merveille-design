"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/actions/admin-orders";
import { Input } from "@/components/ui/input";
import type { Order } from "@/types/database";

const trainingStatuses = [
  "training_received",
  "training_pending",
  "training_validated",
  "training_scheduled",
  "training_completed",
  "training_cancelled",
] as const;

const statusLabels: Record<string, string> = {
  training_received: "Reçue",
  training_pending: "En attente",
  training_validated: "Validée",
  training_scheduled: "Planifiée",
  training_completed: "Terminée",
  training_cancelled: "Annulée",
};

function statusBadgeClass(status: string) {
  if (status === "training_completed") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
  if (status === "training_cancelled") return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
  if (status === "training_validated" || status === "training_scheduled") {
    return "bg-sky-500/15 text-sky-700 dark:text-sky-300";
  }
  return "bg-[var(--muted)]/60 text-[var(--muted-foreground)]";
}

function trainingLabel(order: Order, trainingNamesById: Record<string, string>) {
  if (!order.training_id) return "Formation non renseignée";
  return trainingNamesById[order.training_id] ?? "Formation supprimée";
}

function customerMessage(order: Order) {
  return order.details?.trim() || order.customization_request?.trim() || "Aucun message client.";
}

export function TrainingBookingsAdmin({
  bookings,
  trainingNamesById,
  trainingThumbsById,
}: {
  bookings: Order[];
  trainingNamesById: Record<string, string>;
  trainingThumbsById: Record<string, string>;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | string>("all");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return bookings.filter((b) => {
      if (status !== "all" && b.status !== status) return false;
      if (!query) return true;
      const hay = [b.customer_name, b.phone, b.email ?? "", trainingLabel(b, trainingNamesById), customerMessage(b)]
        .join(" ")
        .toLowerCase();
      return hay.includes(query);
    });
  }, [bookings, q, status, trainingNamesById]);

  function setBookingStatus(id: string, nextStatus: string) {
    startTransition(async () => {
      const res = await updateOrderStatus({ id, status: nextStatus });
      if (res.ok) toast.success("Réservation mise à jour");
      else toast.error(res.error ?? "Erreur");
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3 lg:p-4">
      <div className="space-y-1">
        <h2 className="font-display text-xl font-semibold">Réservations formations</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Demandes d&apos;inscription, suivi du statut et message client.</p>
      </div>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_14rem]">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher: client, téléphone, formation..."
          className="h-11"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm"
        >
          <option value="all">Tous les statuts</option>
          {trainingStatuses.map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-2">
        {filtered.length === 0 ? (
          <li className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">
            Aucune réservation trouvée.
          </li>
        ) : (
          filtered.map((b) => (
            <li key={b.id} className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[3rem_minmax(0,1fr)_13rem] lg:items-center">
                <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--muted)]">
                  {b.training_id && trainingThumbsById[b.training_id] ? (
                    <Image
                      src={trainingThumbsById[b.training_id]}
                      alt="Miniature formation"
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{b.customer_name}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusBadgeClass(b.status)}`}>
                      {statusLabels[b.status] ?? b.status}
                    </span>
                  </div>
                  <p className="truncate text-xs text-[var(--muted-foreground)]">
                    {trainingLabel(b, trainingNamesById)} · {b.phone} · {new Date(b.created_at).toLocaleDateString("fr-FR")}
                  </p>
                  <p className="line-clamp-2 text-xs text-[var(--muted-foreground)]">{customerMessage(b)}</p>
                </div>

                <select
                  className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-2 text-xs"
                  defaultValue={b.status}
                  disabled={pending}
                  onChange={(e) => setBookingStatus(b.id, e.target.value)}
                >
                  {trainingStatuses.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
