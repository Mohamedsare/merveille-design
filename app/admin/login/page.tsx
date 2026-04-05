import Link from "next/link";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { AdminLoginForm } from "@/features/admin/login-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminLoginPage() {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: admin } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();
      if (admin) redirect("/admin/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] px-4 py-16">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-soft">
        <div className="flex justify-center">
          <BrandLogo variant="login" priority />
        </div>
        <p className="mt-4 text-center text-sm text-[var(--muted-foreground)]">Espace administrateur</p>
        <AdminLoginForm />
        <p className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
          <Link href="/" className="underline underline-offset-2">
            Retour au site
          </Link>
        </p>
      </div>
    </div>
  );
}
