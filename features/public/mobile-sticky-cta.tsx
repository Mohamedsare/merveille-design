"use client";

import { Button } from "@/components/ui/button";
import { useTrackEvent } from "@/hooks/use-analytics";

export function MobileStickyCta({ whatsappNumber }: { whatsappNumber: string }) {
  const track = useTrackEvent();
  const wa = whatsappNumber.replace(/\D/g, "");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--border)] bg-[var(--background)]/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:hidden">
      <div className="mx-auto flex max-w-6xl gap-2">
        <Button asChild className="flex-1">
          <a
            href="#commander"
            onClick={() => void track("sticky_cta_click", { cta: "commander_mobile" })}
          >
            Commander
          </a>
        </Button>
        <Button asChild variant="secondary" className="flex-1">
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent("Bonjour Merveill'S Design, je souhaite commander un sac.")}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void track("sticky_cta_click", { cta: "whatsapp_mobile" })}
          >
            WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
