import { Activity, BadgePercent, CircleCheck, ClipboardList, Eye, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orderStatusLabelFr } from "@/lib/admin-fr";
import { getPosthogHost } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function ratio(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export default async function AdminAnalyticsPage() {
  const supabase = await createServerSupabaseClient();
  let events: { event_name: string; c: number }[] = [];
  let recent: { event_name: string; page_path: string | null; created_at: string }[] = [];
  let topPages: { page_path: string; c: number }[] = [];
  let orderStatusSplit: { status: string; c: number }[] = [];
  let adminAudit: {
    event_name: string;
    page_path: string | null;
    created_at: string;
    metadata: Record<string, unknown> | null;
  }[] = [];
  let kpi = {
    visitors7d: 0,
    views7d: 0,
    orders7d: 0,
    contacts7d: 0,
    conversion7d: "0%",
    deliveredRate: "0%",
  };

  if (supabase) {
    const since7 = new Date();
    since7.setDate(since7.getDate() - 7);

    const { data: raw } = await supabase.from("visitor_events").select("event_name").limit(5000);
    const m = new Map<string, number>();
    for (const r of raw ?? []) {
      const n = (r as { event_name: string }).event_name;
      m.set(n, (m.get(n) ?? 0) + 1);
    }
    events = Array.from(m.entries()).map(([event_name, c]) => ({ event_name, c }));
    events.sort((a, b) => b.c - a.c);

    const { data: events7dRaw } = await supabase
      .from("visitor_events")
      .select("event_name, page_path, session_id")
      .gte("created_at", since7.toISOString())
      .limit(8000);
    const sessions = new Set<string>();
    const pages = new Map<string, number>();
    let views7d = 0;
    for (const e of events7dRaw ?? []) {
      if (e.session_id) sessions.add(e.session_id);
      if (e.event_name === "page_view") views7d += 1;
      if (e.page_path) pages.set(e.page_path, (pages.get(e.page_path) ?? 0) + 1);
    }
    topPages = Array.from(pages.entries())
      .map(([page_path, c]) => ({ page_path, c }))
      .sort((a, b) => b.c - a.c)
      .slice(0, 8);

    const { data: orders7dRaw } = await supabase
      .from("orders")
      .select("id,status,created_at")
      .gte("created_at", since7.toISOString())
      .limit(5000);
    const orders7d = (orders7dRaw ?? []).length;
    const delivered7d = (orders7dRaw ?? []).filter((o) => o.status === "delivered").length;

    const { data: orderSplitRaw } = await supabase.from("orders").select("status").limit(6000);
    const statusCount = new Map<string, number>();
    for (const o of orderSplitRaw ?? []) {
      const s = (o as { status: string }).status;
      statusCount.set(s, (statusCount.get(s) ?? 0) + 1);
    }
    orderStatusSplit = Array.from(statusCount.entries())
      .map(([status, c]) => ({ status, c }))
      .sort((a, b) => b.c - a.c);

    let contacts7d = 0;
    const { count: contactCount } = await supabase
      .from("contact_messages")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since7.toISOString());
    contacts7d = contactCount ?? 0;

    kpi = {
      visitors7d: sessions.size,
      views7d,
      orders7d,
      contacts7d,
      conversion7d: ratio(orders7d, views7d),
      deliveredRate: ratio(delivered7d, orders7d),
    };

    const { data: rec } = await supabase
      .from("visitor_events")
      .select("event_name, page_path, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    recent = (rec as typeof recent) ?? [];

    const { data: adminRec } = await supabase
      .from("visitor_events")
      .select("event_name, page_path, created_at, metadata")
      .ilike("event_name", "admin_%")
      .order("created_at", { ascending: false })
      .limit(40);
    adminAudit = (adminRec as typeof adminAudit) ?? [];
  }

  const posthogHost = getPosthogHost();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Indicateurs business + événements visiteurs. Pour les analyses avancées (funnels, cohortes), utilisez PostHog :{" "}
          <a href={posthogHost} className="underline underline-offset-2" target="_blank" rel="noreferrer">
            ouvrir
          </a>
        </p>
      </div>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Card className="border-[var(--border)]">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Eye className="h-4 w-4" /> Vues (7 jours)
            </CardDescription>
            <CardTitle>{kpi.views7d}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-[var(--border)]">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4" /> Visiteurs uniques (7 jours)
            </CardDescription>
            <CardTitle>{kpi.visitors7d}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-[var(--border)]">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" /> Commandes (7 jours)
            </CardDescription>
            <CardTitle>{kpi.orders7d}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-[var(--border)]">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> Messages contact (7 jours)
            </CardDescription>
            <CardTitle>{kpi.contacts7d}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-[var(--border)]">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <BadgePercent className="h-4 w-4" /> Taux de conversion brut
            </CardDescription>
            <CardTitle>{kpi.conversion7d}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-[var(--border)]">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CircleCheck className="h-4 w-4" /> Taux livré (sur commandes 7j)
            </CardDescription>
            <CardTitle>{kpi.deliveredRate}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-[var(--border)]">
          <CardHeader>
            <CardTitle className="font-display text-lg">Pages les plus vues (7 jours)</CardTitle>
          </CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Aucune vue enregistrée sur la période.</p>
            ) : (
              <ul className="space-y-2">
                {topPages.map((p) => (
                  <li key={p.page_path} className="flex items-center justify-between rounded-lg bg-[var(--muted)]/35 px-3 py-2">
                    <span className="truncate text-sm">{p.page_path}</span>
                    <span className="text-xs font-medium">{p.c}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-[var(--border)]">
          <CardHeader>
            <CardTitle className="font-display text-lg">Répartition des statuts commande</CardTitle>
          </CardHeader>
          <CardContent>
            {orderStatusSplit.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)]">Aucune commande disponible.</p>
            ) : (
              <ul className="space-y-2">
                {orderStatusSplit.slice(0, 8).map((s) => (
                  <li key={s.status} className="flex items-center justify-between rounded-lg bg-[var(--muted)]/35 px-3 py-2">
                    <span className="text-sm">{orderStatusLabelFr(s.status)}</span>
                    <span className="text-xs font-medium">{s.c}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <Card className="border-[var(--border)]">
        <CardHeader>
          <CardTitle className="font-display text-lg">Top événements (échantillon)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Événement</TableHead>
                <TableHead className="text-right">Volume</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-[var(--muted-foreground)]">
                    Aucune donnée — déployez le tracking ou configurez PostHog.
                  </TableCell>
                </TableRow>
              ) : (
                events.slice(0, 20).map((e) => (
                  <TableRow key={e.event_name}>
                    <TableCell className="font-mono text-xs">{e.event_name}</TableCell>
                    <TableCell className="text-right">{e.c}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-[var(--border)]">
        <CardHeader>
          <CardTitle className="font-display text-lg">Flux récent</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {recent.map((r, i) => (
              <li key={i} className="flex flex-wrap justify-between gap-2 border-b border-[var(--border)]/60 py-2">
                <span className="font-mono text-xs">{r.event_name}</span>
                <span className="text-[var(--muted-foreground)]">{r.page_path}</span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {new Date(r.created_at).toLocaleString("fr-FR")}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-[var(--border)]">
        <CardHeader>
          <CardTitle className="font-display text-lg">Journal d&apos;audit admin</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {adminAudit.length === 0 ? (
              <li className="py-4 text-[var(--muted-foreground)]">Aucun événement d&apos;audit pour le moment.</li>
            ) : (
              adminAudit.map((r, i) => {
                const who =
                  (typeof r.metadata?.admin_email === "string" && r.metadata.admin_email) ||
                  (typeof r.metadata?.admin_id === "string" && r.metadata.admin_id) ||
                  "admin";
                return (
                  <li key={`${r.event_name}-${r.created_at}-${i}`} className="border-b border-[var(--border)]/60 py-2">
                    <p className="font-mono text-xs">{r.event_name}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {who} · {r.page_path ?? "/admin"}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {new Date(r.created_at).toLocaleString("fr-FR")}
                    </p>
                  </li>
                );
              })
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
