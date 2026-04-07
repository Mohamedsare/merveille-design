"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { logAdminAuditEvent } from "@/lib/admin-audit";

type LoginRateState = {
  failures: number;
  firstFailureAt: number;
  blockedUntil: number;
};

const loginRateStore = new Map<string, LoginRateState>();
const LOGIN_WINDOW_MS = 10 * 60 * 1000; // 10 min
const LOGIN_BLOCK_MS = 15 * 60 * 1000; // 15 min
const LOGIN_MAX_FAILURES = 5;

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Nom trop court"),
  avatarUrl: z.string().trim().optional().default(""),
});

const emailSchema = z.object({
  email: z.string().trim().email("Email invalide"),
});

const passwordSchema = z.object({
  password: z.string().min(8, "8 caractères minimum"),
  confirmPassword: z.string().min(8, "8 caractères minimum"),
});

function getClientIp(rawForwardedFor: string | null, rawRealIp: string | null): string {
  const first = rawForwardedFor?.split(",")[0]?.trim();
  return first || rawRealIp || "unknown";
}

function loginRateKey(email: string, ip: string) {
  return `${email.trim().toLowerCase()}::${ip}`;
}

function cleanupRateStore(now: number) {
  for (const [k, v] of loginRateStore.entries()) {
    if (v.blockedUntil > 0 && v.blockedUntil > now) continue;
    if (now - v.firstFailureAt <= LOGIN_WINDOW_MS) continue;
    loginRateStore.delete(k);
  }
}

export async function checkAdminLoginRateLimit(email: string) {
  const h = await headers();
  const ip = getClientIp(h.get("x-forwarded-for"), h.get("x-real-ip"));
  const key = loginRateKey(email, ip);
  const now = Date.now();
  cleanupRateStore(now);
  const entry = loginRateStore.get(key);
  if (entry && entry.blockedUntil > now) {
    return {
      ok: false as const,
      retryAfterSeconds: Math.ceil((entry.blockedUntil - now) / 1000),
      message: "Trop de tentatives. Réessayez plus tard.",
    };
  }
  return { ok: true as const };
}

export async function registerAdminLoginFailure(email: string, reason: string) {
  const h = await headers();
  const ip = getClientIp(h.get("x-forwarded-for"), h.get("x-real-ip"));
  const key = loginRateKey(email, ip);
  const now = Date.now();
  const existing = loginRateStore.get(key);

  let next: LoginRateState;
  if (!existing || now - existing.firstFailureAt > LOGIN_WINDOW_MS) {
    next = { failures: 1, firstFailureAt: now, blockedUntil: 0 };
  } else {
    next = { ...existing, failures: existing.failures + 1 };
  }
  if (next.failures >= LOGIN_MAX_FAILURES) {
    next.blockedUntil = now + LOGIN_BLOCK_MS;
  }
  loginRateStore.set(key, next);

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await logAdminAuditEvent(
      supabase,
      "login_failure",
      { email: email.trim().toLowerCase(), ip, reason, failures: next.failures },
      "/admin/login"
    );
  }

  return {
    blocked: next.blockedUntil > now,
    retryAfterSeconds: next.blockedUntil > now ? Math.ceil((next.blockedUntil - now) / 1000) : 0,
  };
}

export async function registerAdminLoginSuccess(email: string) {
  const h = await headers();
  const ip = getClientIp(h.get("x-forwarded-for"), h.get("x-real-ip"));
  const key = loginRateKey(email, ip);
  loginRateStore.delete(key);

  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await logAdminAuditEvent(
      supabase,
      "login_success",
      { email: email.trim().toLowerCase(), ip },
      "/admin/login"
    );
  }
}

export async function signOutAdmin() {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await logAdminAuditEvent(supabase, "logout", {}, "/admin/dashboard");
    await supabase.auth.signOut();
  }
  revalidatePath("/admin");
  redirect("/admin/login");
}

export async function updateAdminProfile(raw: unknown) {
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Donnée invalide" };
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };

  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: parsed.data.fullName,
      avatar_url: parsed.data.avatarUrl || null,
    },
  });
  if (error) return { ok: false as const, error: error.message };

  await logAdminAuditEvent(
    supabase,
    "profile_update",
    { full_name: parsed.data.fullName, avatar_url: parsed.data.avatarUrl || null },
    "/admin/dashboard/account"
  );
  revalidatePath("/admin/dashboard/account");
  return { ok: true as const };
}

export async function updateAdminEmail(raw: unknown) {
  const parsed = emailSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Email invalide" };
  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };

  const { error } = await supabase.auth.updateUser({ email: parsed.data.email });
  if (error) return { ok: false as const, error: error.message };

  await logAdminAuditEvent(supabase, "email_update", { email: parsed.data.email }, "/admin/dashboard/account");
  revalidatePath("/admin/dashboard/account");
  return {
    ok: true as const,
    message: "Demande envoyée. Vérifiez votre boîte email pour confirmer le changement.",
  };
}

export async function updateAdminPassword(raw: unknown) {
  const parsed = passwordSchema.safeParse(raw);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Mot de passe invalide" };
  if (parsed.data.password !== parsed.data.confirmPassword) {
    return { ok: false as const, error: "Les mots de passe ne correspondent pas" };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false as const, error: "Non configuré" };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { ok: false as const, error: error.message };

  await logAdminAuditEvent(supabase, "password_update", {}, "/admin/dashboard/account");
  revalidatePath("/admin/dashboard/account");
  return { ok: true as const };
}
