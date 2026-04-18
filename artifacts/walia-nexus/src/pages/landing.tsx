import { MarketingNav } from "@/components/marketing/MarketingNav";
import { HeroSection } from "@/components/marketing/HeroSection";
import { FeaturesSection } from "@/components/marketing/FeaturesSection";
import { PricingSection } from "@/components/marketing/PricingSection";
import { FooterSection } from "@/components/marketing/FooterSection";
import { SocialProofBanner } from "@/components/marketing/SocialProofBanner";
import { CtaBanner } from "@/components/marketing/CtaBanner";

export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col text-white"
      style={{ background: "#080c14" }}
    >
      <MarketingNav />
      <HeroSection />
      <SocialProofBanner />
      <FeaturesSection />
      <PricingSection />
      <CtaBanner />
      <FooterSection />
    </div>
  );
}
