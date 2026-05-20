'use client';

import type { BookingIntent } from '@/components/booking/BookingModal';
import styles from './Nav.module.css';

interface Props {
  onBook: (intent: BookingIntent) => void;
}

export default function Nav({ onBook }: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo / wordmark */}
        <a href="#" className={styles.logo} aria-label="VELAR — home">
          <span className={styles.logoMark}>VELAR</span>
          <span className={styles.logoSub}>Mobile Detailing</span>
        </a>

        {/* Right actions */}
        <nav className={styles.actions} aria-label="Primary navigation">
          <a href="#pricing" className={styles.navLink}>
            Pricing
          </a>
          <a href="#faq" className={styles.navLink}>
            FAQ
          </a>
          <button
            type="button"
            className={styles.bookBtn}
            onClick={() => onBook({})}
          >
            Book Now
          </button>
        </nav>
      </div>
    </header>
  );
}
