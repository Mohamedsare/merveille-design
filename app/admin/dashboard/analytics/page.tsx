import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPosthogHost } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminAnalyticsPage() {
  const supabase = await createServerSupabaseClient();
  let events: { event_name: string; c: number }[] = [];
  let recent: { event_name: string; page_path: string | null; created_at: string }[] = [];
  let adminAudit: {
    event_name: string;
    page_path: string | null;
    created_at: string;
    metadata: Record<string, unknown> | null;
  }[] = [];

  if (supabase) {
    const { data: raw } = await supabase.from("visitor_events").select("event_name").limit(5000);
    const m = new Map<string, number>();
    for (const r of raw ?? []) {
      const n = (r as { event_name: string }).event_name;
      m.set(n, (m.get(n) ?? 0) + 1);
    }
    events = Array.from(m.entries()).map(([event_name, c]) => ({ event_name, c }));
    events.sort((a, b) => b.c - a.c);

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
          Événements stockés localement + PostHog pour temps réel, entonnoirs et géographie. Tableau PostHog :{" "}
          <a href={posthogHost} className="underline underline-offset-2" target="_blank" rel="noreferrer">
            ouvrir
          </a>
        </p>
      </div>

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
