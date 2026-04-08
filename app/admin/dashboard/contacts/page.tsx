import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  ContactMessagesList,
  type ContactMessageRow,
} from "@/features/admin/contact-messages-list";

export default async function AdminContactsPage() {
  const supabase = await createServerSupabaseClient();
  let messages: ContactMessageRow[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("contact_messages")
      .select("id,name,phone,message,status,created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    messages = (data as ContactMessageRow[]) ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Messages contact</h1>
        <p className="text-sm text-[var(--muted-foreground)]">Messages envoyés via le formulaire de contact du site.</p>
      </div>

      <ContactMessagesList messages={messages} />
    </div>
  );
}
