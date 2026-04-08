import type { Metadata } from "next";
import {
  getPublicCategories,
  getPublicProducts,
  getPublicTrainings,
  getSiteSettings,
} from "@/lib/data/public-content";
import { getPublicSiteUrl } from "@/lib/site-url";
import { PublicHeader } from "@/features/public/public-header";
import { HeroSection } from "@/features/public/hero-section";
import { TrustBarSection } from "@/features/public/trust-bar-section";
import { WhyChooseSection } from "@/features/public/why-choose-section";
import { ModelsGallery } from "@/features/public/models-gallery";
import { LifestyleGallerySection } from "@/features/public/lifestyle-gallery-section";
import { HowItWorksSection } from "@/features/public/how-it-works";
import { BrandStorySection } from "@/features/public/brand-story-section";
import { BoxSection } from "@/features/public/box-section";
import { TrainingsSection } from "@/features/public/trainings-section";
import { TestimonialsSection } from "@/features/public/testimonials-section";
import { FAQSection } from "@/features/public/faq-section";
import { ContactSection } from "@/features/public/contact-section";
import { FinalCtaSection } from "@/features/public/final-cta-section";
import { MobileStickyCta } from "@/features/public/mobile-sticky-cta";
import { PublicFooter } from "@/features/public/public-footer";
import { WhatsAppFloat } from "@/features/public/whatsapp-float";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { PublicPageClient } from "@/features/public/public-page-client";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings.seo_title?.trim() || "Sacs africains elegants faits main au Burkina Faso";
  const description =
    settings.seo_description?.trim() ||
    "Merveill'S Design propose des sacs artisanaux premium, personnalises et livres au Burkina Faso et en Afrique.";
  const keywords = (settings.seo_keywords?.trim() || "sacs artisanaux Burkina Faso, sacs africains elegants, maroquinerie Bobo-Dioulasso")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      locale: "fr_BF",
      type: "website",
      url: "/",
    },
  };
}

export default async function HomePage() {
  const [settings, categories, products, trainings] = await Promise.all([
    getSiteSettings(),
    getPublicCategories(),
    getPublicProducts(),
    getPublicTrainings(),
  ]);

  const boxProducts = products.filter((p) => p.type === "box");
  const baseUrl = getPublicSiteUrl().toString().replace(/\/$/, "");
  const productList = products.slice(0, 8);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: settings.site_name,
        url: baseUrl,
        areaServed: ["Burkina Faso", "Afrique"],
        sameAs: settings.social_links ? Object.values(settings.social_links).filter(Boolean) : [],
      },
      {
        "@type": "ItemList",
        name: "Collection de sacs artisanaux",
        itemListElement: productList.map((product, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "Product",
            name: product.name,
            description: product.short_description ?? "Sac artisanal premium",
            image: product.cover_image_url ? [product.cover_image_url] : [],
            url: `${baseUrl}/#modeles`,
          },
        })),
      },
    ],
  };

  return (
    <>
      <PublicPageClient />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PublicHeader settings={settings} />
      <main>
        <HeroSection settings={settings} />
        <TrustBarSection />
        <WhyChooseSection />
        <ModelsGallery products={products} categories={categories} settings={settings} />
        <LifestyleGallerySection settings={settings} products={products} />
        <HowItWorksSection settings={settings} />
        <BrandStorySection settings={settings} />
        <BoxSection boxProducts={boxProducts} settings={settings} />
        <TrainingsSection trainings={trainings} settings={settings} />
        <TestimonialsSection settings={settings} />
        <ScrollReveal>
          <FAQSection settings={settings} />
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <ContactSection settings={settings} />
        </ScrollReveal>
        <FinalCtaSection />
      </main>
      <PublicFooter settings={settings} />
      <MobileStickyCta whatsappNumber={settings.whatsapp_number ?? "22600000000"} />
      <WhatsAppFloat number={settings.whatsapp_number ?? "22600000000"} />
    </>
  );
}
