"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { signOutAdmin, updateAdminEmail, updateAdminPassword, updateAdminProfile } from "@/actions/auth";
import { AdminImageField } from "@/components/admin/admin-image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminAccountForm({
  email,
  fullName,
  avatarUrl,
}: {
  email: string;
  fullName: string;
  avatarUrl: string;
}) {
  const [pendingProfile, startProfile] = useTransition();
  const [pendingEmail, startEmail] = useTransition();
  const [pendingPassword, startPassword] = useTransition();
  const [name, setName] = useState(fullName);
  const [mail, setMail] = useState(email);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="font-display text-lg font-semibold">Informations du compte</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Mettez à jour votre nom affiché dans l&apos;espace admin.
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startProfile(async () => {
              const res = await updateAdminProfile({
                fullName: name,
                avatarUrl: String(fd.get("avatar_url") ?? ""),
              });
              if (res.ok) toast.success("Profil mis à jour");
              else toast.error(res.error);
            });
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="acc_full_name">Nom complet</Label>
            <Input
              id="acc_full_name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Merveille Design"
            />
          </div>
          <AdminImageField
            name="avatar_url"
            folder="settings"
            label="Photo de profil"
            defaultUrl={avatarUrl}
          />
          <Button type="submit" disabled={pendingProfile}>
            {pendingProfile ? "Mise à jour..." : "Enregistrer le profil"}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="font-display text-lg font-semibold">Adresse email</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Changer l&apos;email de connexion (confirmation possible par email).
        </p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            startEmail(async () => {
              const res = await updateAdminEmail({ email: mail });
              if (res.ok) toast.success("Demande envoyée. Vérifiez votre email.");
              else toast.error(res.error);
            });
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="acc_email">Email</Label>
            <Input
              id="acc_email"
              type="email"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              placeholder="admin@exemple.com"
            />
          </div>
          <Button type="submit" disabled={pendingEmail}>
            {pendingEmail ? "Mise à jour..." : "Mettre à jour l'email"}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="font-display text-lg font-semibold">Mot de passe</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Renforcez la sécurité de votre compte administrateur.</p>
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            startPassword(async () => {
              const res = await updateAdminPassword({ password, confirmPassword });
              if (res.ok) {
                setPassword("");
                setConfirmPassword("");
                toast.success("Mot de passe mis à jour");
              } else toast.error(res.error);
            });
          }}
        >
          <div className="space-y-1">
            <Label htmlFor="acc_password">Nouveau mot de passe</Label>
            <Input
              id="acc_password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 caractères"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="acc_password_confirm">Confirmer le mot de passe</Label>
            <Input
              id="acc_password_confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Retapez le mot de passe"
            />
          </div>
          <Button type="submit" disabled={pendingPassword}>
            {pendingPassword ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </Button>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <h2 className="font-display text-lg font-semibold">Session</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">Déconnectez-vous en un clic.</p>
        <form action={signOutAdmin} className="mt-4">
          <Button type="submit" variant="outline">
            Déconnexion
          </Button>
        </form>
      </section>
    </div>
  );
}
