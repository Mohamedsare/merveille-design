import {
  getPublicCategories,
  getPublicProducts,
  getPublicTrainings,
  getSiteSettings,
} from "@/lib/data/public-content";
import { PublicHeader } from "@/features/public/public-header";
import { HeroSection } from "@/features/public/hero-section";
import { ModelsGallery } from "@/features/public/models-gallery";
import { HowItWorksSection } from "@/features/public/how-it-works";
import { BoxSection } from "@/features/public/box-section";
import { TrainingsSection } from "@/features/public/trainings-section";
import { TestimonialsSection } from "@/features/public/testimonials-section";
import { FAQSection } from "@/features/public/faq-section";
import { ContactSection } from "@/features/public/contact-section";
import { PublicFooter } from "@/features/public/public-footer";
import { WhatsAppFloat } from "@/features/public/whatsapp-float";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { PublicPageClient } from "@/features/public/public-page-client";

export default async function HomePage() {
  const [settings, categories, products, trainings] = await Promise.all([
    getSiteSettings(),
    getPublicCategories(),
    getPublicProducts(),
    getPublicTrainings(),
  ]);

  const boxProducts = products.filter((p) => p.type === "box");

  return (
    <>
      <PublicPageClient />
      <PublicHeader settings={settings} />
      <main>
        <HeroSection settings={settings} />
        <ModelsGallery products={products} categories={categories} settings={settings} />
        <HowItWorksSection settings={settings} />
        <BoxSection boxProducts={boxProducts} settings={settings} />
        <TrainingsSection trainings={trainings} settings={settings} />
        <TestimonialsSection settings={settings} />
        <ScrollReveal>
          <FAQSection settings={settings} />
        </ScrollReveal>
        <ScrollReveal delay={0.05}>
          <ContactSection settings={settings} />
        </ScrollReveal>
      </main>
      <PublicFooter settings={settings} />
      <WhatsAppFloat number={settings.whatsapp_number ?? "22600000000"} />
    </>
  );
}
