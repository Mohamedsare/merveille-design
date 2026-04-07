"use client";

import { WhatsAppBrandMark } from "@/components/whatsapp-brand-mark";
import { useTrackEvent } from "@/hooks/use-analytics";

export function WhatsAppFloat({ number }: { number: string }) {
  const track = useTrackEvent();
  const wa = number.replace(/\D/g, "");

  return (
    <a
      href={`https://wa.me/${wa}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-4 z-50 flex h-14 w-14 items-center justify-center transition-transform hover:scale-105 hover:shadow-[0_6px_20px_rgba(37,211,102,0.45)] active:scale-95 md:bottom-5 md:right-5"
      aria-label="Ouvrir WhatsApp"
      onClick={() => void track("whatsapp_click", { from: "float" })}
    >
      <WhatsAppBrandMark variant="float" />
    </a>
  );
}
