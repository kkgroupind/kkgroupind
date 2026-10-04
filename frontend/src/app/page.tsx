'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Home/Navbar';
import { HeroSection } from '@/components/Home/HeroSection';
import { PopularPackagesSection } from '@/components/Home/PopularPackagesSection';
import { PoultryFarmingSection } from '@/components/Home/PoultryFarmingSection';
import { CosmicConnectionsSection } from '@/components/Home/CosmicConnectionsSection';
import { FaqSection } from '@/components/Home/FaqSection';
import { Footer } from '@/components/Home/Footer';
import { EnquiryBox } from '@/components/Home/EnquiryBox';
import { HomeLoader } from '@/components/Home/HomeLoader';

export default function HomePage() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);

  const handleOpenEnquiry = (serviceName?: string) => {
    setSelectedService(serviceName);
    setIsEnquiryOpen(true);
  };

  const handleCloseEnquiry = () => {
    setIsEnquiryOpen(false);
    setSelectedService(undefined);
  };

  return (
    <div className="w-full min-h-screen bg-white text-[#0F172A] font-sans antialiased selection:bg-[#2A835F] selection:text-white flex flex-col scroll-smooth">
      {/* High-Tech Cool Splash Loader */}
      <HomeLoader />

      {/* Fixed Navbar with Enquire Button */}
      <Navbar onOpenEnquiry={() => handleOpenEnquiry()} />

      {/* ========================================================
          1. FIRST SECTION: Nexora Hero Section (Clean Light Canvas)
      ======================================================== */}
      <section className="w-full pt-16 sm:pt-20 bg-white relative overflow-visible flex flex-col">
        <HeroSection onOpenEnquiry={handleOpenEnquiry} />
      </section>

      {/* ========================================================
          2. SECOND SECTION: Popular Field Packages & Fleet Booking
      ======================================================== */}
      <PopularPackagesSection onSelectPackage={handleOpenEnquiry} />

      {/* ========================================================
          3. THIRD SECTION: Poultry & Commercial Chicken Farming
      ======================================================== */}
      <PoultryFarmingSection />

      {/* ========================================================
          4. FOURTH SECTION: Regional Operations Network & Live Fleet
      ======================================================== */}
      <CosmicConnectionsSection onOpenEnquiry={handleOpenEnquiry} />

      {/* ========================================================
          4. FOURTH SECTION: Frequently Asked Questions (FAQ)
      ======================================================== */}
      <FaqSection onOpenEnquiry={handleOpenEnquiry} />

      {/* ========================================================
          5. FIFTH SECTION: Master Footer with Curvy Top Edges
      ======================================================== */}
      <Footer />

      {/* Hero-Styled Enquiry Modal */}
      <EnquiryBox
        isOpen={isEnquiryOpen}
        onClose={handleCloseEnquiry}
        initialService={selectedService}
      />
    </div>
  );
}
