import { demoCategories, demoProducts, demoSettings, demoTrainings } from "@/lib/demo-data";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Category, Product, SiteSettings, Training } from "@/types/database";

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!isSupabaseConfigured()) return demoSettings;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return demoSettings;
  const { data } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  return (data as SiteSettings) ?? demoSettings;
}

export async function getPublicCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return demoCategories;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return demoCategories;
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return (data as Category[])?.length ? (data as Category[]) : demoCategories;
}

export async function getPublicProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return demoProducts;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return demoProducts;
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("display_order");
  return (data as Product[])?.length ? (data as Product[]) : demoProducts;
}

export async function getPublicTrainings(): Promise<Training[]> {
  if (!isSupabaseConfigured()) return demoTrainings;
  const supabase = await createServerSupabaseClient();
  if (!supabase) return demoTrainings;
  const { data } = await supabase
    .from("trainings")
    .select("*")
    .eq("is_published", true)
    .order("display_order");
  return (data as Training[])?.length ? (data as Training[]) : demoTrainings;
}
