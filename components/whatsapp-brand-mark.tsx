import { WhatsAppLogo } from "@/components/icons/whatsapp-logo";
import { cn } from "@/lib/utils";

type Props = {
  /** Bouton flottant (56px) ou pastille CTA (36px) */
  variant?: "float" | "inline";
  className?: string;
};

export function WhatsAppBrandMark({ variant = "float", className }: Props) {
  const isFloat = variant === "float";
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        isFloat
          ? "h-14 w-14 shadow-[0_4px_14px_rgba(37,211,102,0.45)] ring-2 ring-white/25"
          : "h-9 w-9 shadow-sm ring-1 ring-black/10",
        className
      )}
    >
      <WhatsAppLogo className="h-full w-full" />
    </span>
  );
}
