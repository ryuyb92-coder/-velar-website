'use client';

import { VELAR_PHONE, VELAR_PHONE_DISPLAY } from '@/lib/config';
import type { BookingIntent } from '@/components/booking/BookingModal';
import styles from './FinalCTA.module.css';

interface Props {
  onBook: (intent: BookingIntent) => void;
}

export default function FinalCTA({ onBook }: Props) {
  return (
    <section className={styles.section} aria-labelledby="cta-heading">
      <div className={styles.container}>

        <span className={styles.eyebrow}>Dallas, TX · Mobile Detailing</span>

        <h2 className={styles.heading} id="cta-heading">
          Ready for a cleaner car?
        </h2>

        <p className={styles.subheading}>
          Book in under two minutes. We'll confirm and come to you.
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.bookBtn}
            onClick={() => onBook({})}
          >
            Book a Detail
          </button>

          <div className={styles.contactLinks}>
            <a href={`tel:+1${VELAR_PHONE}`} className={styles.contactLink}>
              <PhoneIcon /> Call {VELAR_PHONE_DISPLAY}
            </a>
            <span className={styles.contactDivider} aria-hidden="true">·</span>
            <a href={`sms:+1${VELAR_PHONE}`} className={styles.contactLink}>
              <TextIcon /> Send a Text
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

function PhoneIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path
        d="M2.2 1.3C2.2 1.3.8 2.8.8 5.3c0 4 3.5 7 8 7 2.5 0 4-1.5 4-1.5l-2-2.5-1.5 1C8.3 10 5.8 8 5.8 6.5l1-1.5-2.5-3.5-.1-.2z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 13" fill="none" aria-hidden="true">
      <path
        d="M1 1h12v8H7.5l-3 3V9H1V1z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
