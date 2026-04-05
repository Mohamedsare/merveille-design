export function getSupabaseUrl(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_URL;
}

export function getSupabaseAnonKey(): string | undefined {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export function getPosthogKey(): string | undefined {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY;
}

export function getPosthogHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com";
}

export function getWhatsAppDefault(): string {
  return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "22600000000";
}
