import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  /** Conteneur : hauteur fixe, largeur max pour préserver le ratio */
  variant?: "header" | "footer" | "admin" | "login";
  priority?: boolean;
  alt?: string;
};

const variantClass: Record<NonNullable<BrandLogoProps["variant"]>, string> = {
  header: "h-9 w-[150px] sm:h-10 sm:w-[170px]",
  footer: "h-10 w-[160px] sm:h-11 sm:w-[180px]",
  admin: "h-8 w-[130px]",
  login: "mx-auto h-14 w-[220px] sm:h-16 sm:w-[260px]",
};

export function BrandLogo({
  className,
  variant = "header",
  priority = false,
  alt = "Merveill design",
}: BrandLogoProps) {
  const isHeader = variant === "header";

  return (
    <span
      className={cn(
        "relative inline-block shrink-0",
        variantClass[variant],
        isHeader && "overflow-hidden",
        className
      )}
    >
      <span
        className={cn(
          "relative block h-full w-full",
          isHeader && "origin-left scale-[1.62] sm:scale-[1.55]"
        )}
      >
        <Image
          src="/logo.png"
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 640px) 160px, 200px"
          className={cn(
            "object-contain",
            variant === "login" ? "object-center" : "object-left"
          )}
        />
      </span>
    </span>
  );
}
