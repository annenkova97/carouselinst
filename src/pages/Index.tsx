import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FontShowcaseSection } from "@/components/landing/FontShowcaseSection";
import { CTASection } from "@/components/landing/CTASection";
import { SavedProjectsSection } from "@/components/landing/SavedProjectsSection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <SavedProjectsSection />
        <HowItWorksSection />
        <FontShowcaseSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
