"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { LucideIcon } from "lucide-react";
import { Activity, BarChart2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export type DashboardChartsProps = {
  ordersByDay: { date: string; count: number }[];
  categorySplit: { name: string; value: number }[];
  eventsLast7: { date: string; count: number }[];
};

function ChartCard({
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`overflow-hidden rounded-2xl border border-[var(--border)]/90 bg-gradient-to-b from-[var(--card)] to-[var(--card)]/95 shadow-[0_2px_20px_-6px_rgba(44,40,37,0.08)] backdrop-blur-sm sm:rounded-3xl ${className ?? ""}`}
    >
      <CardHeader className="space-y-2 border-b border-[var(--border)]/50 p-4 pb-4 sm:p-6 sm:pb-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] ring-1 ring-[var(--primary)]/10">
            <Icon className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <CardTitle className="font-display text-base font-semibold leading-snug tracking-tight sm:text-lg">
              {title}
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed sm:text-[13px]">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-5">{children}</CardContent>
    </Card>
  );
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-56 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--muted)]/20 px-4 text-center sm:h-64">
      <p className="text-sm font-medium text-[var(--muted-foreground)]">{message}</p>
      <p className="max-w-xs text-xs text-[var(--muted-foreground)]/80">
        Les données apparaîtront dès les premières commandes ou visites enregistrées.
      </p>
    </div>
  );
}

export function DashboardCharts({ ordersByDay, categorySplit, eventsLast7 }: DashboardChartsProps) {
  const hasOrders = ordersByDay.length > 0;
  const hasSplit = categorySplit.length > 0;
  const hasEvents = eventsLast7.length > 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <ChartCard
          title="Commandes"
          description="Volume sur les 14 derniers jours"
          icon={TrendingUp}
        >
          <div className="h-[220px] w-full sm:h-64 lg:h-72">
            {hasOrders ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ordersByDay} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fillOrdersDash" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5c4033" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="#5c4033" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="var(--border)" strokeOpacity={0.85} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    dy={8}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <Tooltip
                    cursor={{ stroke: "var(--primary)", strokeWidth: 1, strokeOpacity: 0.2 }}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "14px",
                      boxShadow: "0 8px 30px -12px rgba(44,40,37,0.2)",
                      fontSize: "13px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#5c4033"
                    strokeWidth={2.25}
                    fill="url(#fillOrdersDash)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Pas encore de données sur cette période" />
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Types de commandes"
          description="Répartition récente par catégorie"
          icon={BarChart2}
        >
          <div className="h-[220px] w-full sm:h-64 lg:h-72">
            {hasSplit ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySplit} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="var(--border)" strokeOpacity={0.85} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-12}
                    textAnchor="end"
                    height={48}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    tickLine={false}
                    axisLine={false}
                    width={36}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.25 }}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "14px",
                      boxShadow: "0 8px 30px -12px rgba(44,40,37,0.2)",
                      fontSize: "13px",
                    }}
                  />
                  <Bar dataKey="value" fill="#c4a574" radius={[8, 8, 4, 4]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Aucune répartition à afficher" />
            )}
          </div>
        </ChartCard>
      </div>

      <ChartCard
        title="Activité site"
        description="Événements enregistrés sur 14 jours"
        icon={Activity}
      >
        <div className="h-52 w-full sm:h-60">
          {hasEvents ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={eventsLast7} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 8" vertical={false} stroke="var(--border)" strokeOpacity={0.85} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  dy={8}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  width={36}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "14px",
                    boxShadow: "0 8px 30px -12px rgba(44,40,37,0.2)",
                    fontSize: "13px",
                  }}
                />
                <Area
                  type="step"
                  dataKey="count"
                  stroke="#b8956a"
                  strokeWidth={2}
                  fill="#c4a574"
                  fillOpacity={0.18}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="Les événements analytics apparaîtront ici" />
          )}
        </div>
      </ChartCard>
    </div>
  );
}
