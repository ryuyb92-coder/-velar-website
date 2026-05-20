'use client';

import { VELAR_PHONE, VELAR_PHONE_DISPLAY } from '@/lib/config';
import type { BookingIntent } from '@/components/booking/BookingModal';
import styles from './StickyMobileCTA.module.css';

interface Props {
  onBook: (intent: BookingIntent) => void;
}

export default function StickyMobileCTA({ onBook }: Props) {
  return (
    <div className={styles.bar} role="complementary" aria-label="Quick booking actions">
      <a
        href={`tel:+1${VELAR_PHONE}`}
        className={styles.contactLink}
        aria-label={`Call ${VELAR_PHONE_DISPLAY}`}
      >
        <PhoneIcon />
        <span>Call</span>
      </a>

      <a
        href={`sms:+1${VELAR_PHONE}`}
        className={styles.contactLink}
        aria-label="Send a text"
      >
        <TextIcon />
        <span>Text</span>
      </a>

      <button
        className={styles.bookBtn}
        onClick={() => onBook({})}
        type="button"
      >
        Book Now
      </button>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path
        d="M2.2 1.3C2.2 1.3.8 2.8.8 5.3c0 4 3.5 7 8 7 2.5 0 4-1.5 4-1.5l-2-2.5-1.5 1C8.3 10 5.8 8 5.8 6.5l1-1.5-2.5-3.5-.1-.2z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 14 13" fill="none" aria-hidden="true">
      <path
        d="M1 1h12v8H7.5l-3 3V9H1V1z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}
