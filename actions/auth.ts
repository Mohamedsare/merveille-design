"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function signOutAdmin() {
  const supabase = await createServerSupabaseClient();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/admin");
  redirect("/admin/login");
}
