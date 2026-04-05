"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WhatsAppBrandMark } from "@/components/whatsapp-brand-mark";
import { submitQuickContact } from "@/actions/orders";
import { useTrackEvent } from "@/hooks/use-analytics";
import type { SiteSettings } from "@/types/database";

export function ContactSection({ settings }: { settings: SiteSettings }) {
  const [pending, startTransition] = useTransition();
  const track = useTrackEvent();
  const wa = (settings.whatsapp_number ?? "").replace(/\D/g, "");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await submitQuickContact({
        name: fd.get("name"),
        phone: fd.get("phone"),
        message: fd.get("message"),
      });
      if (res.ok) {
        toast.success("Message envoyé. Merci !");
        (e.target as HTMLFormElement).reset();
        void track("form_submit", { form: "contact_quick" });
      } else {
        toast.error(res.error ?? "Erreur");
      }
    });
  }

  return (
    <section id="contact" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl rounded-[2rem] bg-gradient-to-br from-[var(--primary)]/90 to-[var(--primary)] p-8 text-[var(--primary-foreground)] shadow-soft md:p-12">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Parlons de votre projet</h2>
            <p className="mt-4 text-sm leading-relaxed opacity-90">
              Une question, une idée floue ou un cadeau urgent : écrivez-nous. Réponse personnalisée sous 24h
              en semaine.
            </p>
            {settings.contact_email ? (
              <p className="mt-6 text-sm">
                <span className="opacity-80">Email · </span>
                <a className="underline underline-offset-2" href={`mailto:${settings.contact_email}`}>
                  {settings.contact_email}
                </a>
              </p>
            ) : null}
            <Button asChild size="lg" variant="secondary" className="mt-8 w-full gap-3 sm:w-auto">
              <a
                href={`https://wa.me/${wa}?text=${encodeURIComponent("Bonjour Merveill design, je souhaite discuter d’un projet.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center"
                onClick={() => void track("whatsapp_click", { from: "contact_cta" })}
              >
                <WhatsAppBrandMark variant="inline" className="shadow-sm" />
                Écrire sur WhatsApp
              </a>
            </Button>
          </div>
          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-[var(--card)] p-6 text-[var(--foreground)]">
            <div className="space-y-2">
              <Label htmlFor="c_name">Nom</Label>
              <Input id="c_name" name="name" required className="bg-[var(--input-bg)]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c_phone">Téléphone</Label>
              <Input id="c_phone" name="phone" required className="bg-[var(--input-bg)]" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="c_message">Message</Label>
              <Textarea
                id="c_message"
                name="message"
                required
                rows={4}
                className="bg-[var(--input-bg)]"
                placeholder="Décrivez votre besoin…"
              />
            </div>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Envoi…" : "Envoyer"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
