import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AppPostHogProvider } from "@/components/providers/posthog-provider";
import { SiteScrollEffects } from "@/components/site-scroll-effects";
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
    "Merveill'S Design cree des sacs africains elegants faits main au Burkina Faso. Commande sur mesure, personnalisation, livraison locale et en Afrique.",
  keywords: [
    "sacs africains elegants",
    "sac fait main Burkina Faso",
    "sac a main Ouagadougou",
    "sac artisanal Bobo-Dioulasso",
    "maroquinerie Burkina Faso",
    "box cadeau",
    "formation sac",
    "Merveill design",
  ],
  openGraph: {
    title: "Merveill design",
    description: "Sacs africains premium faits main, personnalises et livres au Burkina Faso.",
    locale: "fr_BF",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png", sizes: "any" },
    ],
    apple: [
      { url: "/logo.png", sizes: "180x180", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
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
          <SiteScrollEffects />
          {children}
          <Toaster position="top-center" richColors />
        </AppPostHogProvider>
      </body>
    </html>
  );
}
