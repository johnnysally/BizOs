import { Hero } from '@/components/public/Hero';
import { FeatureStrip } from '@/components/public/FeatureStrip';
import { FeatureGrid } from '@/components/public/FeatureGrid';
import { HowItWorks } from '@/components/public/HowItWorks';
import { PricingPreview } from '@/components/public/PricingPreview';
import { FAQ } from '@/components/public/FAQ';
import { CTASection } from '@/components/public/CTASection';
import { PublicChatWidget } from '@/components/public/PublicChatWidget';

export default function Landing() {
  return (
    <>
      <Hero />
      <FeatureStrip />
      <FeatureGrid />
      <HowItWorks />
      <PricingPreview />
      <FAQ />
      <CTASection />
      <PublicChatWidget />
    </>
  );
}