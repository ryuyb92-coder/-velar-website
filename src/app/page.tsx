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

type CurtainState = 'hidden' | 'rising' | 'falling';

export default function Home() {
  const [gateIntent, setGateIntent] = useState<BookingIntent | null>(null);
  const [intent, setIntent]         = useState<BookingIntent | null>(null);
  const [curtain, setCurtain]       = useState<CurtainState>('hidden');

  function openBooking(i: BookingIntent = {}) {
    setGateIntent(i);
  }

  function onGateContinue(phone: string, name: string) {
    if (!gateIntent) return;
    const combined: BookingIntent = { ...gateIntent, prefillPhone: phone, prefillName: name };

    // Phase 1: Curtain rises (360ms) — covers gate + website
    setCurtain('rising');

    setTimeout(() => {
      // Phase 2: Under the covered screen — swap components
      setGateIntent(null);
      setIntent(combined);
      // Phase 3: Curtain falls (320ms) — booking fades in simultaneously
      setCurtain('falling');

      setTimeout(() => {
        setCurtain('hidden');
      }, 330);
    }, 370);
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

      {/* Gate — unchanged, exactly as-is */}
      {gateIntent !== null && (
        <ContactGateModal
          intent={gateIntent}
          onContinue={onGateContinue}
          onClose={closeGate}
        />
      )}

      {/* Transition curtain — rises above gate, falls to reveal booking */}
      {curtain !== 'hidden' && (
        <div className={
          curtain === 'rising' ? 'bookingCurtain bookingCurtainRising' : 'bookingCurtain bookingCurtainFalling'
        } />
      )}

      {/* Full-screen booking experience */}
      {intent !== null && (
        <BookingModal intent={intent} onClose={closeBooking} />
      )}
    </>
  );
}
