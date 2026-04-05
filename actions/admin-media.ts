"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { safeImageExtension, validateImageFile } from "@/lib/media-upload";

const FOLDERS = ["products", "trainings", "site", "hero"] as const;
export type AdminMediaFolder = (typeof FOLDERS)[number];

export async function uploadAdminMedia(
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const file = formData.get("file");
  const folderRaw = String(formData.get("folder") ?? "products");

  if (!(file instanceof File)) {
    return { ok: false, error: "Aucun fichier" };
  }

  const valid = validateImageFile(file);
  if (!valid.ok) return valid;

  const folder = (FOLDERS.includes(folderRaw as AdminMediaFolder) ? folderRaw : "products") as AdminMediaFolder;

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Supabase non configuré" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const ext = safeImageExtension(file.name, file.type);
  const path = `${folder}/${Date.now()}-${crypto.randomUUID().slice(0, 10)}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from("media").upload(path, buf, {
    contentType: file.type,
    upsert: false,
  });

  if (error) return { ok: false, error: error.message };

  const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
  return { ok: true, url: pub.publicUrl };
}
