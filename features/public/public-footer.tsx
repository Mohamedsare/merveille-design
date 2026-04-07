import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import type { SiteSettings } from "@/types/database";

export function PublicFooter({ settings }: { settings: SiteSettings }) {
  const social = settings.social_links ?? {};

  return (
    <footer className="border-t border-[var(--border)] px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <BrandLogo variant="footer" alt={settings.site_name} />
          <p className="mt-4 max-w-sm text-sm text-[var(--muted-foreground)]">
            Sacs à main artisanaux, box cadeaux et formations — à Bobo-Dioulasso, Burkina Faso.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm">
          <a href="#modeles" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Modèles
          </a>
          <a href="#histoire" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Histoire
          </a>
          <a href="#commander" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Commander
          </a>
          <a href="#formations" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Formations
          </a>
          <a href="#contact" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
            Contact
          </a>
          {"instagram" in social && social.instagram ? (
            <Link
              href={social.instagram}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              target="_blank"
            >
              Instagram
            </Link>
          ) : null}
          {"facebook" in social && social.facebook ? (
            <Link
              href={social.facebook}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              target="_blank"
            >
              Facebook
            </Link>
          ) : null}
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl text-center text-xs text-[var(--muted-foreground)]">
        © {new Date().getFullYear()} {settings.site_name}. Tous droits réservés.
      </p>
    </footer>
  );
}
