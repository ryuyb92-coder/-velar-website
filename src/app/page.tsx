'use client';

import { useState } from 'react';
import Nav from '@/components/layout/Nav';
import HeroSection from '@/components/sections/HeroSection';
import WhyVelar from '@/components/sections/WhyVelar';
import ProcessSection from '@/components/sections/ProcessSection';
import PricingSection from '@/components/pricing/PricingSection';
import FAQSection from '@/components/sections/FAQSection';
import FinalCTA from '@/components/sections/FinalCTA';
import Footer from '@/components/layout/Footer';
import StickyMobileCTA from '@/components/ui/StickyMobileCTA';
import BookingModal from '@/components/booking/BookingModal';
import type { BookingIntent } from '@/components/booking/BookingModal';

export default function Home() {
  const [intent, setIntent] = useState<BookingIntent | null>(null);

  function openBooking(i: BookingIntent = {}) {
    setIntent(i);
  }

  function closeBooking() {
    setIntent(null);
  }

  return (
    <>
      <Nav onBook={openBooking} />

      <main className="page-main">
        <HeroSection onBook={openBooking} />
        <WhyVelar />
        <ProcessSection />
        <PricingSection onBook={openBooking} />
        <FAQSection />
        <FinalCTA onBook={openBooking} />
        <Footer />
      </main>

      <StickyMobileCTA onBook={openBooking} />

      {intent !== null && (
        <BookingModal intent={intent} onClose={closeBooking} />
      )}
    </>
  );
}
