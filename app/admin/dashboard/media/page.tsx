import { MediaEnhancePanel } from "@/features/admin/media-enhance-panel";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function AdminMediaPage() {
  const supabase = await createServerSupabaseClient();
  let rows: {
    id: string;
    image_url: string;
    enhancement_status: string;
    product_id: string;
    products: { name: string } | null;
  }[] = [];

  if (supabase) {
    const { data: images } = await supabase
      .from("product_images")
      .select("id, image_url, enhancement_status, product_id")
      .order("created_at", { ascending: false });
    const { data: products } = await supabase.from("products").select("id, name");
    const nameById = new Map((products ?? []).map((p) => [p.id as string, p.name as string]));
    rows =
      (images ?? []).map((img) => ({
        id: img.id as string,
        image_url: img.image_url as string,
        enhancement_status: img.enhancement_status as string,
        product_id: img.product_id as string,
        products: { name: nameById.get(img.product_id as string) ?? "Produit" },
      })) ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Médias & amélioration</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Pipeline Sharp subtil. Bucket Supabase <code className="rounded bg-[var(--muted)] px-1">media</code>{" "}
          requis pour l’upload des versions améliorées.
        </p>
      </div>
      <MediaEnhancePanel rows={rows} />
    </div>
  );
}
