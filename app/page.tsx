import React from 'react';
import Hero from '@/components/hero/Hero';
import AboutSection from '@/components/about/AboutSection';
import SelectedWork from '@/components/projects/SelectedWork';
import MarqueeBanner from '@/components/marquee/MarqueeBanner';
import StackSection from '@/components/stack/StackSection';
import JourneySection from '@/components/journey/JourneySection';
import AwardsSection from '@/components/awards/AwardsSection';
import FaqSection from '@/components/faq/FaqSection';
import ContactSection from '@/components/contact/ContactSection';
import FooterSection from '@/components/footer/FooterSection';

export default function HomePage() {
  return (
    <>
      {/* 00. Hero & Three.js Particle Halftone Portrait (Approved, Untouched) */}
      <Hero />

      {/* 01. About (From Problem to Production-Ready) */}
      <AboutSection />

      {/* 02. Selected Work (Sticky Stacking Cards) */}
      <SelectedWork />

      {/* 03. Angled Marquee Banner */}
      <MarqueeBanner />

      {/* 04. Technology Stack with Spotlight & Cascading Tabs */}
      <StackSection />

      {/* 05. Journey (Experience & Education Timeline) */}
      <JourneySection />

      {/* 06. Awards & Accolades with 3D Tilt Certificate */}
      <AwardsSection />

      {/* 07. FAQ Accordion */}
      <FaqSection />

      {/* 08. Contact Section */}
      <ContactSection />

      {/* 09. Minimalist Dark Footer */}
      <FooterSection />
    </>
  );
}
