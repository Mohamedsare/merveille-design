import { Inbox, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardCharts } from "@/features/admin/dashboard-charts";
import { DashboardKpiGrid } from "@/features/admin/dashboard-kpi-grid";
import { getAdminOverview } from "@/lib/data/admin-stats";

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

export default async function AdminDashboardPage() {
  const s = await getAdminOverview();

  const kpiItems = [
    { label: "Commandes totales", value: s.ordersTotal },
    { label: "Nouvelles", value: s.ordersNew },
    { label: "En cours", value: s.ordersInProgress },
    { label: "Livrées", value: s.ordersDelivered },
    { label: "Produits publiés", value: s.productsPublished },
    { label: "Formations actives", value: s.trainingsPublished },
  ];

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border)]/80 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--muted)]/35 p-5 shadow-[0_8px_40px_-20px_rgba(44,40,37,0.15)] sm:rounded-3xl sm:p-7 md:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-[var(--primary)]/[0.07] blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-[var(--accent)]/15 blur-3xl" aria-hidden />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden />
              Aujourd’hui
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl md:text-[2rem] md:leading-tight">
              Vue d’ensemble
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-[var(--muted-foreground)] sm:text-[15px]">
              Suivez l’activité de la boutique : commandes, catalogue et signaux visiteurs, en un coup d’œil.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="kpi-heading">
        <h2 id="kpi-heading" className="sr-only">
          Indicateurs clés
        </h2>
        <DashboardKpiGrid items={kpiItems} />
      </section>

      <section aria-labelledby="charts-heading" className="space-y-4">
        <div className="px-0.5">
          <h2 id="charts-heading" className="font-display text-lg font-semibold tracking-tight sm:text-xl">
            Tendances
          </h2>
          <p className="mt-1 text-xs text-[var(--muted-foreground)] sm:text-sm">
            Visualisations adaptées au mobile — faites défiler pour tout parcourir.
          </p>
        </div>
        <DashboardCharts
          ordersByDay={s.ordersByDay}
          categorySplit={s.categorySplit}
          eventsLast7={s.eventsLast7}
        />
      </section>

      <section aria-labelledby="recent-heading">
        <Card className="overflow-hidden rounded-2xl border border-[var(--border)]/90 bg-gradient-to-b from-[var(--card)] to-[var(--card)]/95 shadow-[0_4px_28px_-16px_rgba(44,40,37,0.12)] sm:rounded-3xl">
          <CardHeader className="border-b border-[var(--border)]/60 bg-[var(--muted)]/15 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--card)] text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]/80">
                <Inbox className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <div>
                <CardTitle id="recent-heading" className="font-display text-lg sm:text-xl">
                  Dernières commandes
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Les demandes les plus récentes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {s.recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-14 text-center">
                <Inbox className="h-10 w-10 text-[var(--muted-foreground)]/40" />
                <p className="text-sm font-medium text-[var(--muted-foreground)]">Aucune commande pour l’instant</p>
                <p className="max-w-xs text-xs text-[var(--muted-foreground)]/80">
                  Dès qu’un client envoie un formulaire, la ligne apparaîtra ici.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[var(--border)]/70">
                {s.recentOrders.map((o) => (
                  <li
                    key={o.id}
                    className="flex min-h-[56px] items-center gap-3 px-4 py-4 transition-colors active:bg-[var(--muted)]/25 sm:gap-4 sm:px-6 sm:py-5"
                  >
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--primary)]/12 to-[var(--muted)]/50 text-sm font-semibold text-[var(--primary)] ring-1 ring-[var(--border)]/60"
                      aria-hidden
                    >
                      {initials(o.customer_name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-[var(--foreground)]">{o.customer_name}</p>
                      <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                        {new Date(o.created_at).toLocaleString("fr-FR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[var(--muted)]/55 px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--foreground)] ring-1 ring-[var(--border)]/50 sm:text-xs">
                      {o.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
