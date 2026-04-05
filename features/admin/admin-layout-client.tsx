"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu, PanelLeftClose, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOutAdmin } from "@/actions/auth";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ADMIN_NAV } from "@/features/admin/admin-nav";
import { cn } from "@/lib/utils";

function NavList({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1.5 p-3", className)}>
      {ADMIN_NAV.map(({ href, label, icon: Icon, description }) => {
        const activeExact =
          href === "/admin/dashboard"
            ? pathname === "/admin/dashboard"
            : pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "group relative flex min-h-[52px] touch-manipulation items-center gap-3.5 rounded-2xl px-3.5 py-3 transition-all duration-200",
              "active:scale-[0.98]",
              activeExact
                ? "bg-gradient-to-r from-[var(--primary)]/14 to-[var(--primary)]/5 text-[var(--primary)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] ring-1 ring-[var(--primary)]/15"
                : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]/45 hover:text-[var(--foreground)]"
            )}
          >
            {activeExact ? (
              <span
                className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-[var(--primary)]"
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                activeExact
                  ? "bg-[var(--card)] text-[var(--primary)] shadow-sm ring-1 ring-[var(--border)]/60"
                  : "bg-[var(--muted)]/40 text-[var(--muted-foreground)] group-hover:bg-[var(--card)] group-hover:text-[var(--foreground)]"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1 text-left">
              <span className="block text-sm font-semibold tracking-tight">{label}</span>
              <span className="mt-0.5 block text-[11px] font-normal leading-tight text-[var(--muted-foreground)] group-hover:text-[var(--muted-foreground)]/90">
                {description}
              </span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="admin-app min-h-dvh bg-gradient-to-b from-[#f2ebe3] via-[var(--background)] to-[#efe8df] text-[var(--foreground)]">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex h-[3.75rem] items-center gap-3 border-b border-[var(--border)]/70 bg-[var(--card)]/85 px-4 shadow-[0_4px_24px_-8px_rgba(44,40,37,0.12)] backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--card)]/72 lg:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-12 w-12 shrink-0 rounded-2xl border border-[var(--border)]/80 bg-[var(--background)]/80 text-[var(--foreground)] shadow-sm"
          aria-expanded={mobileOpen}
          aria-controls="admin-mobile-nav"
          aria-label="Ouvrir le menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold tracking-tight text-[var(--primary)]">
            Espace pro
          </p>
          <p className="truncate text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            Merveill design
          </p>
        </div>
      </header>

      <div className="flex min-h-[calc(100dvh-3.75rem)] lg:min-h-screen">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen max-h-[100dvh] w-[min(100%,18rem)] shrink-0 flex-col border-r border-[var(--border)]/80 bg-[var(--card)]/90 shadow-[4px_0_32px_-12px_rgba(44,40,37,0.08)] backdrop-blur-xl lg:flex xl:w-72">
          <div className="px-5 pb-2 pt-7">
            <Link href="/admin/dashboard" className="block outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--ring)]" aria-label="Accueil admin">
              <BrandLogo variant="admin" />
            </Link>
            <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              Administration
            </p>
          </div>
          <Separator className="mx-4 bg-[var(--border)]/80" />
          <ScrollArea className="min-h-0 flex-1">
            <NavList />
          </ScrollArea>
          <div className="border-t border-[var(--border)]/70 p-4">
            <form action={signOutAdmin}>
              <Button
                type="submit"
                variant="ghost"
                className="h-12 w-full justify-start gap-3 rounded-2xl px-4 text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 hover:text-[var(--foreground)]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--muted)]/40">
                  <LogOut className="h-4 w-4" />
                </span>
                Déconnexion
              </Button>
            </form>
          </div>
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              key="admin-drawer"
              className="fixed inset-0 z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                type="button"
                className="absolute inset-0 bg-[var(--foreground)]/30 backdrop-blur-[2px]"
                aria-label="Fermer le menu"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                id="admin-mobile-nav"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation administration"
                initial={{ x: "-105%" }}
                animate={{ x: 0 }}
                exit={{ x: "-105%" }}
                transition={{ type: "spring", damping: 30, stiffness: 320 }}
                className="absolute inset-y-0 left-0 flex w-[min(100vw-2rem,20.5rem)] max-w-[20.5rem] flex-col border-r border-[var(--border)] bg-[var(--card)] shadow-[8px_0_40px_-12px_rgba(44,40,37,0.2)]"
              >
                <div className="flex items-center justify-between gap-2 border-b border-[var(--border)]/80 px-4 py-4">
                  <BrandLogo variant="admin" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 shrink-0 rounded-xl"
                    aria-label="Fermer"
                    onClick={() => setMobileOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <ScrollArea className="min-h-0 flex-1">
                  <NavList onNavigate={() => setMobileOpen(false)} />
                </ScrollArea>
                <div className="border-t border-[var(--border)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  <form action={signOutAdmin}>
                    <Button
                      type="submit"
                      variant="ghost"
                      className="h-12 w-full justify-start gap-3 rounded-2xl text-[var(--muted-foreground)]"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </Button>
                  </form>
                </div>
              </motion.aside>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 hidden border-b border-[var(--border)]/60 bg-[var(--background)]/75 px-6 py-4 backdrop-blur-md lg:flex lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
              <PanelLeftClose className="h-4 w-4 opacity-50" aria-hidden />
              <span className="text-sm font-medium">Tableau de bord</span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)]">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </header>
          <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pb-10 pt-5 sm:px-5 md:px-8 md:pb-12 md:pt-8 lg:pt-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
