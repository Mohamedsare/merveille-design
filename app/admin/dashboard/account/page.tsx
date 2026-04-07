import { AdminAccountForm } from "@/features/admin/admin-account-form";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminAccountPage() {
  const supabase = await createServerSupabaseClient();
  let email = "";
  let fullName = "";
  let avatarUrl = "";

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    email = user?.email ?? "";
    fullName = (typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "") || "";
    avatarUrl = (typeof user?.user_metadata?.avatar_url === "string" ? user.user_metadata.avatar_url : "") || "";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Mon compte</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Gérez entièrement votre profil administrateur: nom, email, mot de passe et session.
        </p>
      </div>

      <AdminAccountForm email={email} fullName={fullName} avatarUrl={avatarUrl} />
    </div>
  );
}
