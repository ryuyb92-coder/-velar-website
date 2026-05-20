'use client';

import { useState } from 'react';
import { CATEGORIES } from '@/lib/pricing-data';
import type { CategoryId } from '@/lib/pricing-data';
import type { BookingIntent } from '@/components/booking/BookingModal';
import PricingTabs from './PricingTabs';
import XLToggle from './XLToggle';
import PricingGrid from './PricingGrid';
import EnhancementsSection from './EnhancementsSection';
import styles from './PricingSection.module.css';

interface Props {
  onBook: (intent: BookingIntent) => void;
}

export default function PricingSection({ onBook }: Props) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('interior-exterior');
  const [isXL, setIsXL] = useState(false);

  const category = CATEGORIES.find((c) => c.id === activeCategory)!;

  return (
    <section className={styles.section} id="pricing">
      <div className={styles.container}>

        {/* Section header */}
        <div className={styles.header}>
          <span className={styles.eyebrow}>Mobile Detailing · Dallas, TX</span>
          <h2 className={styles.heading}>
            Transparent Pricing.{' '}
            <span className={styles.headingAlt}>No Surprises.</span>
          </h2>
          <p className={styles.subheading}>
            Every detail is included. No hidden fees, no upcharges at the door.
          </p>
        </div>

        {/* Controls */}
        <div className={styles.controls}>
          <PricingTabs
            categories={CATEGORIES}
            activeId={activeCategory}
            onSelect={setActiveCategory}
          />
          <XLToggle isXL={isXL} onChange={setIsXL} />
        </div>

        {/* Cards */}
        <div className={styles.cardsWrapper}>
          <PricingGrid
            packages={category.packages}
            isXL={isXL}
            categoryLabel={category.label}
            onBook={onBook}
          />
        </div>

        {/* Trust signal */}
        <p className={styles.trust}>
          Trusted by 100+ Dallas vehicle owners &nbsp;·&nbsp; 5-star rated
        </p>

        {/* Enhancements */}
        <EnhancementsSection />

      </div>
    </section>
  );
}
