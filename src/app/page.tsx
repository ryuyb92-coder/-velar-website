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
import ContactGateModal from '@/components/booking/ContactGateModal';
import BookingModal from '@/components/booking/BookingModal';
import type { BookingIntent } from '@/components/booking/BookingModal';

export default function Home() {
  // gateIntent: non-null while the entry gate is open
  const [gateIntent, setGateIntent] = useState<BookingIntent | null>(null);
  // intent: non-null while the 7-step booking modal is open
  const [intent, setIntent] = useState<BookingIntent | null>(null);

  // All "Book Now" entry points open the gate first
  function openBooking(i: BookingIntent = {}) {
    setGateIntent(i);
  }

  // Gate → 7-step: merge package intent with contact prefill
  function onGateContinue(phone: string, name: string) {
    if (!gateIntent) return;
    setGateIntent(null);
    setIntent({ ...gateIntent, prefillPhone: phone, prefillName: name });
  }

  function closeGate() {
    setGateIntent(null);
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

      {gateIntent !== null && (
        <ContactGateModal
          intent={gateIntent}
          onContinue={onGateContinue}
          onClose={closeGate}
        />
      )}

      {intent !== null && (
        <BookingModal intent={intent} onClose={closeBooking} />
      )}
    </>
  );
}
