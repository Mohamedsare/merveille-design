"use client";

import Image from "next/image";
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
  const contactBanner = settings.contact_section_image_url?.trim();

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
    <section
      id="contact"
      className="scroll-mt-20 px-3 py-12 pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-16 md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-6xl rounded-2xl bg-gradient-to-br from-[var(--primary)]/90 to-[var(--primary)] p-5 text-[var(--primary-foreground)] shadow-soft sm:rounded-3xl sm:p-8 md:rounded-[2rem] md:p-12">
        {contactBanner ? (
          <div className="relative mb-6 aspect-[21/9] max-h-56 w-full overflow-hidden rounded-xl ring-2 ring-white/20">
            <Image src={contactBanner} alt="" fill className="object-cover" sizes="(max-width: 1200px) 100vw, 1152px" />
          </div>
        ) : null}
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <h2 className="font-display text-2xl font-semibold leading-[1.15] tracking-tight sm:text-3xl md:text-4xl">
              Parlons de votre projet
            </h2>
            <p className="mt-3 max-w-prose text-base leading-relaxed opacity-90 sm:mt-4">
              Une question, une idée floue ou un cadeau urgent : écrivez-nous. Réponse personnalisée sous 24h
              en semaine.
            </p>
            <p className="mt-3 text-sm opacity-90">
              Devis clair avant validation, personnalisation possible et livraison au Burkina Faso.
            </p>
            {settings.contact_email ? (
              <p className="mt-5 text-sm sm:mt-6">
                <span className="block text-[0.8125rem] opacity-80 sm:inline sm:text-inherit">Email</span>
                <span className="hidden sm:inline"> · </span>
                <a
                  className="mt-0.5 block break-all text-base font-medium underline underline-offset-2 sm:mt-0 sm:inline sm:text-sm sm:font-normal"
                  href={`mailto:${settings.contact_email}`}
                >
                  {settings.contact_email}
                </a>
              </p>
            ) : null}
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="mt-6 h-12 w-full gap-3 text-base active:scale-[0.99] sm:mt-8 sm:h-12 sm:w-auto sm:text-sm"
            >
              <a
                href={`https://wa.me/${wa}?text=${encodeURIComponent("Bonjour Merveill design, je souhaite discuter d’un projet.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center px-5 sm:min-h-0 sm:px-8"
                onClick={() => void track("whatsapp_click", { from: "contact_cta" })}
              >
                <WhatsAppBrandMark variant="inline" className="shadow-sm" />
                Écrire sur WhatsApp
              </a>
            </Button>
          </div>
          <form
            onSubmit={onSubmit}
            className="space-y-3.5 rounded-xl bg-[var(--card)] p-4 text-[var(--foreground)] sm:space-y-4 sm:rounded-2xl sm:p-6"
          >
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="c_name">Nom</Label>
              <Input
                id="c_name"
                name="name"
                required
                autoComplete="name"
                inputMode="text"
                enterKeyHint="next"
                className="h-12 bg-[var(--input-bg)] text-base sm:h-11 sm:text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="c_phone">Téléphone</Label>
              <Input
                id="c_phone"
                name="phone"
                required
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                enterKeyHint="next"
                className="h-12 bg-[var(--input-bg)] text-base sm:h-11 sm:text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="c_message">Message</Label>
              <Textarea
                id="c_message"
                name="message"
                required
                rows={4}
                className="min-h-[7.5rem] bg-[var(--input-bg)] text-base sm:min-h-[120px] sm:text-sm"
                placeholder="Décrivez votre besoin…"
              />
            </div>
            <Button type="submit" className="mt-1 h-12 w-full text-base sm:mt-0 sm:text-sm" disabled={pending}>
              {pending ? "Envoi…" : "Envoyer"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
