import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AppPostHogProvider } from "@/components/providers/posthog-provider";
import { getPublicSiteUrl } from "@/lib/site-url";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: getPublicSiteUrl(),
  title: {
    default: "Merveill design | Sacs & box artisanaux Burkina Faso",
    template: "%s · Merveill design",
  },
  description:
    "Sacs à main artisanaux, coffrets cadeaux et formations à Ouagadougou. Commande sur mesure, livraison et accompagnement premium.",
  keywords: [
    "sac à main Ouagadougou",
    "maroquinerie Burkina Faso",
    "box cadeau",
    "formation sac",
    "Merveill design",
  ],
  openGraph: {
    title: "Merveill design",
    description: "Sacs artisanaux, box cadeaux et formations — sur mesure.",
    locale: "fr_BF",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${dmSans.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full antialiased">
        <AppPostHogProvider>
          {children}
          <Toaster position="top-center" richColors />
        </AppPostHogProvider>
      </body>
    </html>
  );
}
