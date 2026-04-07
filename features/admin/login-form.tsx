"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  checkAdminLoginRateLimit,
  registerAdminLoginFailure,
  registerAdminLoginSuccess,
} from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, setPending] = useState(false);
  const errShown = useRef(false);

  useEffect(() => {
    if (params.get("error") === "not_admin" && !errShown.current) {
      errShown.current = true;
      toast.error("Compte non autorisé");
    }
  }, [params]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = createBrowserSupabase();
    if (!supabase) {
      toast.error("Supabase non configuré");
      return;
    }
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const gate = await checkAdminLoginRateLimit(email);
    if (!gate.ok) {
      toast.error(`${gate.message} (${gate.retryAfterSeconds}s)`);
      return;
    }
    setPending(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      await registerAdminLoginFailure(email, "invalid_credentials");
      toast.error(error.message);
      setPending(false);
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      toast.error("Session invalide");
      setPending(false);
      return;
    }
    const { data: admin } = await supabase.from("admin_users").select("id").eq("id", uid).maybeSingle();
    if (!admin) {
      await supabase.auth.signOut();
      await registerAdminLoginFailure(email, "not_admin");
      toast.error("Accès réservé aux administrateurs");
      setPending(false);
      return;
    }
    await registerAdminLoginSuccess(email);
    const next = params.get("next") ?? "/admin/dashboard";
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
