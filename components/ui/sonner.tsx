"use client";

import { Toaster as Sonner } from "sonner";
import { usePathname } from "next/navigation";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        // Admin toasts are intentionally very brief.
        duration: isAdmin ? 1400 : 3200,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[var(--card)] group-[.toaster]:text-[var(--foreground)] group-[.toaster]:border-[var(--border)] group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-[var(--muted-foreground)]",
        },
      }}
      {...props}
    />
  );
}
