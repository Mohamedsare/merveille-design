"use client";

import { motion } from "framer-motion";
import {
  Clock,
  GraduationCap,
  Package,
  PackageCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type KpiTone = "cocoa" | "honey" | "lavender" | "sage" | "sand" | "blush";

const toneStyles: Record<
  KpiTone,
  { iconBg: string; iconRing: string; accent: string; glow: string }
> = {
  cocoa: {
    iconBg: "bg-[#5c4033]/12 text-[#5c4033]",
    iconRing: "ring-[#5c4033]/10",
    accent: "from-[#5c4033]/08 to-transparent",
    glow: "shadow-[0_0_0_1px_rgba(92,64,51,0.06),0_12px_40px_-16px_rgba(92,64,51,0.18)]",
  },
  honey: {
    iconBg: "bg-amber-500/15 text-amber-800",
    iconRing: "ring-amber-500/15",
    accent: "from-amber-500/10 to-transparent",
    glow: "shadow-[0_0_0_1px_rgba(245,158,11,0.08),0_12px_40px_-16px_rgba(245,158,11,0.15)]",
  },
  lavender: {
    iconBg: "bg-violet-500/12 text-violet-800",
    iconRing: "ring-violet-500/12",
    accent: "from-violet-500/10 to-transparent",
    glow: "shadow-[0_0_0_1px_rgba(139,92,246,0.08),0_12px_40px_-16px_rgba(139,92,246,0.14)]",
  },
  sage: {
    iconBg: "bg-emerald-600/12 text-emerald-900",
    iconRing: "ring-emerald-600/10",
    accent: "from-emerald-600/10 to-transparent",
    glow: "shadow-[0_0_0_1px_rgba(5,150,105,0.08),0_12px_40px_-16px_rgba(5,150,105,0.14)]",
  },
  sand: {
    iconBg: "bg-[var(--accent)]/20 text-[#6b5a3e]",
    iconRing: "ring-[var(--accent)]/20",
    accent: "from-[var(--accent)]/15 to-transparent",
    glow: "shadow-[0_0_0_1px_rgba(196,165,116,0.12),0_12px_40px_-16px_rgba(196,165,116,0.2)]",
  },
  blush: {
    iconBg: "bg-rose-400/15 text-rose-900",
    iconRing: "ring-rose-400/12",
    accent: "from-rose-400/12 to-transparent",
    glow: "shadow-[0_0_0_1px_rgba(244,114,182,0.1),0_12px_40px_-16px_rgba(244,114,182,0.14)]",
  },
};

const icons: LucideIcon[] = [ShoppingBag, Sparkles, Clock, PackageCheck, Package, GraduationCap];
const tones: KpiTone[] = ["cocoa", "honey", "lavender", "sage", "sand", "blush"];

export function DashboardKpiGrid({ items }: { items: { label: string; value: number }[] }) {
  return (
    <motion.ul
      className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
      }}
    >
      {items.map((item, i) => {
        const Icon = icons[i] ?? ShoppingBag;
        const tone = tones[i] ?? "cocoa";
        const t = toneStyles[tone];
        return (
          <motion.li
            key={item.label}
            variants={{
              hidden: { opacity: 0, y: 14 },
              show: { opacity: 1, y: 0, transition: { type: "spring", damping: 22, stiffness: 320 } },
            }}
            className={`group relative overflow-hidden rounded-2xl border border-[var(--border)]/90 bg-gradient-to-br from-[var(--card)] via-[var(--card)] to-[var(--muted)]/25 p-4 shadow-sm sm:rounded-3xl sm:p-5 ${t.glow}`}
          >
            <div
              className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${t.accent} opacity-90 blur-2xl transition-opacity group-hover:opacity-100`}
              aria-hidden
            />
            <div className="relative flex flex-col gap-3 sm:gap-4">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ring-1 ${t.iconBg} ${t.iconRing} sm:h-12 sm:w-12`}
                >
                  <Icon className="h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem]" strokeWidth={1.65} />
                </span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-[var(--muted-foreground)] sm:text-xs">
                  {item.label}
                </p>
                <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums tracking-tight text-[var(--foreground)] sm:mt-2 sm:text-3xl">
                  {item.value}
                </p>
              </div>
            </div>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
