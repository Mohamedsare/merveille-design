"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateOrderStatus } from "@/actions/admin-orders";
import { Input } from "@/components/ui/input";
import type { Order } from "@/types/database";

const productOrderStatuses = ["new", "pending", "confirmed", "in_production", "ready", "delivered", "cancelled"] as const;

const trainingOrderStatuses = [
  "training_received",
  "training_pending",
  "training_validated",
  "training_scheduled",
  "training_completed",
  "training_cancelled",
] as const;

const allStatuses = [...productOrderStatuses, ...trainingOrderStatuses];

const statusLabels: Record<string, string> = {
  new: "Nouveau",
  pending: "En attente",
  confirmed: "Confirmé",
  in_production: "En production",
  ready: "Prêt",
  delivered: "Livré",
  cancelled: "Annulé",
  training_received: "Formation reçue",
  training_pending: "Formation en attente",
  training_validated: "Formation validée",
  training_scheduled: "Formation planifiée",
  training_completed: "Formation terminée",
  training_cancelled: "Formation annulée",
};

const orderTypeLabels: Record<Order["order_type"], string> = {
  bag: "Sac",
  box: "Box",
  custom_bag: "Sac personnalisé",
  training: "Formation",
};

function statusBadgeClass(status: string) {
  const colorByStatus: Record<string, string> = {
    // Nouveau / réception
    new: "bg-slate-500/15 text-slate-700 ring-1 ring-slate-500/20 dark:text-slate-300",
    training_received: "bg-slate-500/15 text-slate-700 ring-1 ring-slate-500/20 dark:text-slate-300",

    // En attente
    pending: "bg-amber-500/18 text-amber-800 ring-1 ring-amber-500/25 dark:text-amber-300",
    training_pending: "bg-amber-500/18 text-amber-800 ring-1 ring-amber-500/25 dark:text-amber-300",

    // Confirmé / validé
    confirmed: "bg-sky-500/18 text-sky-800 ring-1 ring-sky-500/25 dark:text-sky-300",
    training_validated: "bg-sky-500/18 text-sky-800 ring-1 ring-sky-500/25 dark:text-sky-300",

    // Production / planification
    in_production: "bg-indigo-500/18 text-indigo-800 ring-1 ring-indigo-500/25 dark:text-indigo-300",
    training_scheduled: "bg-indigo-500/18 text-indigo-800 ring-1 ring-indigo-500/25 dark:text-indigo-300",

    // Prêt
    ready: "bg-cyan-500/18 text-cyan-800 ring-1 ring-cyan-500/25 dark:text-cyan-300",

    // Terminé
    delivered: "bg-emerald-500/18 text-emerald-800 ring-1 ring-emerald-500/25 dark:text-emerald-300",
    training_completed: "bg-emerald-500/18 text-emerald-800 ring-1 ring-emerald-500/25 dark:text-emerald-300",

    // Annulé
    cancelled: "bg-rose-500/18 text-rose-800 ring-1 ring-rose-500/25 dark:text-rose-300",
    training_cancelled: "bg-rose-500/18 text-rose-800 ring-1 ring-rose-500/25 dark:text-rose-300",
  };

  return colorByStatus[status] ?? "bg-[var(--muted)]/60 text-[var(--muted-foreground)] ring-1 ring-[var(--border)]/60";
}

function toStatusLabel(status: string) {
  return statusLabels[status] ?? status;
}

function statusesForOrderType(orderType: Order["order_type"]) {
  if (orderType === "training") return trainingOrderStatuses;
  return productOrderStatuses;
}

function orderIntentLabel(
  order: Order,
  productNamesById: Record<string, string>,
  trainingNamesById: Record<string, string>,
) {
  const base = orderTypeLabels[order.order_type] ?? order.order_type;
  const linkedName =
    (order.product_id ? productNamesById[order.product_id] : null) ||
    (order.training_id ? trainingNamesById[order.training_id] : null) ||
    "";
  const quantity = Number.isFinite(order.quantity) && order.quantity > 0 ? `x${order.quantity}` : "";
  const budget = order.budget ? `Budget: ${order.budget}` : "";
  const target = linkedName ? `${base}: ${linkedName}` : base;
  return [target, quantity, budget].filter(Boolean).join(" · ");
}

function customerMessage(order: Order) {
  return (
    order.customization_request?.trim() ||
    order.details?.trim() ||
    order.fabric_color_notes?.trim() ||
    "Aucun message client renseigné."
  );
}

function thumbForOrder(
  order: Order,
  productThumbsById: Record<string, string>,
  trainingThumbsById: Record<string, string>,
) {
  if (order.product_id && productThumbsById[order.product_id]) return productThumbsById[order.product_id];
  if (order.training_id && trainingThumbsById[order.training_id]) return trainingThumbsById[order.training_id];
  return "";
}

export function OrdersTable({
  orders,
  productNamesById,
  trainingNamesById,
  productThumbsById,
  trainingThumbsById,
}: {
  orders: Order[];
  productNamesById: Record<string, string>;
  trainingNamesById: Record<string, string>;
  productThumbsById: Record<string, string>;
  trainingThumbsById: Record<string, string>;
}) {
  const [pending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Order["order_type"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | string>("all");

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (typeFilter !== "all" && o.order_type !== typeFilter) return false;
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return [o.customer_name, o.phone, o.email ?? "", o.city ?? "", o.country ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [orders, query, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = filteredOrders.length;
    const waiting = filteredOrders.filter((o) =>
      ["new", "pending", "training_received", "training_pending"].includes(o.status),
    ).length;
    const progress = filteredOrders.filter((o) =>
      ["confirmed", "in_production", "ready", "training_validated", "training_scheduled"].includes(o.status),
    ).length;
    const done = filteredOrders.filter((o) => ["delivered", "training_completed"].includes(o.status)).length;
    return { total, waiting, progress, done };
  }, [filteredOrders]);

  function setStatus(id: string, status: string) {
    startTransition(async () => {
      const res = await updateOrderStatus({ id, status });
      if (res.ok) toast.success("Statut mis à jour");
      else toast.error(res.error ?? "Erreur");
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2">
          <p className="text-xs text-[var(--muted-foreground)]">Total</p>
          <p className="text-xl font-semibold">{stats.total}</p>
        </article>
        <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2">
          <p className="text-xs text-[var(--muted-foreground)]">En attente</p>
          <p className="text-xl font-semibold">{stats.waiting}</p>
        </article>
        <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2">
          <p className="text-xs text-[var(--muted-foreground)]">En cours</p>
          <p className="text-xl font-semibold">{stats.progress}</p>
        </article>
        <article className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2">
          <p className="text-xs text-[var(--muted-foreground)]">Terminées</p>
          <p className="text-xl font-semibold">{stats.done}</p>
        </article>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_12rem_14rem]">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher: client, téléphone, email, ville..."
            className="h-11"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as "all" | Order["order_type"])}
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm"
          >
            <option value="all">Tous les types</option>
            <option value="bag">Sac</option>
            <option value="box">Box</option>
            <option value="custom_bag">Sac personnalisé</option>
            <option value="training">Formation</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 text-sm"
          >
            <option value="all">Tous les statuts</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {toStatusLabel(s)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-3 lg:hidden">
        {filteredOrders.map((o) => (
          <article key={o.id} className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--muted)]">
                  {thumbForOrder(o, productThumbsById, trainingThumbsById) ? (
                    <Image
                      src={thumbForOrder(o, productThumbsById, trainingThumbsById)}
                      alt="Miniature commande"
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : null}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{o.customer_name}</p>
                  <p className="truncate text-xs text-[var(--muted-foreground)]">{o.phone}</p>
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs ${statusBadgeClass(o.status)}`}>
                {toStatusLabel(o.status)}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span>{orderTypeLabels[o.order_type] ?? o.order_type}</span>
              <span>{new Date(o.created_at).toLocaleDateString("fr-FR")}</span>
            </div>
            <div className="space-y-1 rounded-lg bg-[var(--muted)]/40 p-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                Demande client
              </p>
              <p className="text-xs">{orderIntentLabel(o, productNamesById, trainingNamesById)}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{customerMessage(o)}</p>
            </div>
            <select
              className="h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-2 text-xs"
              defaultValue={o.status}
              disabled={pending}
              onChange={(e) => setStatus(o.id, e.target.value)}
            >
              {statusesForOrderType(o.order_type).map((s) => (
                <option key={s} value={s}>
                  {toStatusLabel(s)}
                </option>
              ))}
            </select>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[72px]">Miniature</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Demande client</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[230px]">Mettre à jour</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <div className="relative h-10 w-10 overflow-hidden rounded-md border border-[var(--border)] bg-[var(--muted)]">
                    {thumbForOrder(o, productThumbsById, trainingThumbsById) ? (
                      <Image
                        src={thumbForOrder(o, productThumbsById, trainingThumbsById)}
                        alt="Miniature commande"
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{o.customer_name}</TableCell>
                <TableCell>{o.phone}</TableCell>
                <TableCell>{orderTypeLabels[o.order_type] ?? o.order_type}</TableCell>
                <TableCell className="max-w-[360px]">
                  <div className="space-y-0.5">
                    <p className="truncate text-xs font-medium">
                      {orderIntentLabel(o, productNamesById, trainingNamesById)}
                    </p>
                    <p className="line-clamp-2 text-xs text-[var(--muted-foreground)]">{customerMessage(o)}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusBadgeClass(o.status)}`}>
                    {toStatusLabel(o.status)}
                  </span>
                </TableCell>
                <TableCell className="text-xs text-[var(--muted-foreground)]">
                  {new Date(o.created_at).toLocaleDateString("fr-FR")}
                </TableCell>
                <TableCell>
                  <select
                    className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--input-bg)] px-2 text-xs"
                    defaultValue={o.status}
                    disabled={pending}
                    onChange={(e) => setStatus(o.id, e.target.value)}
                  >
                    {statusesForOrderType(o.order_type).map((s) => (
                      <option key={s} value={s}>
                        {toStatusLabel(s)}
                      </option>
                    ))}
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredOrders.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">Aucune commande trouvée avec ces filtres.</p>
      ) : null}
    </div>
  );
}
