import Image from "next/image";

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
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        isFloat
          ? "h-14 w-14 shadow-[0_4px_14px_rgba(37,211,102,0.45)] ring-2 ring-white/25"
          : "h-9 w-9 shadow-sm ring-1 ring-black/10",
        className
      )}
    >
      <Image
        src="/social.svg"
        alt=""
        fill
        className="object-cover"
        sizes={isFloat ? "56px" : "36px"}
      />
    </span>
  );
}
