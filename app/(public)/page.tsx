// app/page.tsx
"use client";

import Hero from "@/components/sections/Hero";
import Collections from "@/components/sections/Collections";
import WhyChooseUs from "@/components/sections/WhyChooseUs";
import GlobalPresence from "@/components/sections/GlobalPresence";
import FeaturedFleet from "@/components/ui/FeatureCard";

export default function HomePage() {
  return (
    <main className="min-h-screen pt-0 bg-white">
      <Hero />
      <Collections />
      <FeaturedFleet />
      <WhyChooseUs />
      <GlobalPresence />
    </main>
  );
}