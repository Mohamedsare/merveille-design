"use client";

import { useTransition } from "react";
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
import type { Order } from "@/types/database";

const statuses = [
  "new",
  "pending",
  "confirmed",
  "in_production",
  "ready",
  "delivered",
  "cancelled",
  "training_received",
  "training_pending",
  "training_validated",
  "training_scheduled",
  "training_completed",
  "training_cancelled",
];

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [pending, startTransition] = useTransition();

  function setStatus(id: string, status: string) {
    startTransition(async () => {
      const res = await updateOrderStatus({ id, status });
      if (res.ok) toast.success("Statut mis à jour");
      else toast.error(res.error ?? "Erreur");
    });
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Téléphone</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[200px]">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((o) => (
            <TableRow key={o.id}>
              <TableCell className="font-medium">{o.customer_name}</TableCell>
              <TableCell>{o.phone}</TableCell>
              <TableCell>{o.order_type}</TableCell>
              <TableCell>
                <span className="rounded-full bg-[var(--muted)]/50 px-2 py-0.5 text-xs">{o.status}</span>
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
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {orders.length === 0 ? (
        <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">Aucune commande</p>
      ) : null}
    </div>
  );
}
