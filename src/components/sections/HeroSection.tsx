'use client';

import type { BookingIntent } from '@/components/booking/BookingModal';
import styles from './HeroSection.module.css';

interface Props {
  onBook: (intent: BookingIntent) => void;
}

export default function HeroSection({ onBook }: Props) {
  return (
    <section className={styles.section} aria-label="Hero">
      <div className={styles.container}>

        <div className={styles.content}>
          <span className={styles.eyebrow}>Mobile Detailing · Dallas, TX</span>

          <h1 className={styles.heading}>
            The Detail<br />
            <span className={styles.headingMuted}>Comes to You.</span>
          </h1>

          <p className={styles.subheading}>
            Professional-grade care brought to your home, office, or anywhere
            in Dallas. No shop visits. No waiting.
          </p>

          <div className={styles.ctas}>
            <button
              type="button"
              className={styles.primaryCta}
              onClick={() => onBook({})}
            >
              Book a Detail
            </button>
            <a href="#pricing" className={styles.secondaryCta}>
              View Pricing
            </a>
          </div>

          <div className={styles.trustBar}>
            <span className={styles.trustItem}>
              <Star /> 5-star rated
            </span>
            <span className={styles.trustDot} aria-hidden="true" />
            <span className={styles.trustItem}>100+ Dallas vehicles detailed</span>
            <span className={styles.trustDot} aria-hidden="true" />
            <span className={styles.trustItem}>Same-day availability</span>
          </div>
        </div>

      </div>
    </section>
  );
}

function Star() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <path d="M6 1l1.4 3h3.1l-2.5 1.8.9 3L6 7.2 3.1 8.8l.9-3L1.5 4H4.6L6 1z" />
    </svg>
  );
}
