import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client serveur avec droits étendus (bypass RLS). Ne jamais l’exposer au client.
 * Utilisé pour uploads publics (ex. photo inspiration commande) si la clé est définie.
 */
export function createServiceSupabaseClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
