'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { BookingIntent } from '@/components/booking/BookingModal';
import styles from './Nav.module.css';

interface Props {
  onBook: (intent: BookingIntent) => void;
}

export default function Nav({ onBook }: Props) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Watch the hero sentinel; when it leaves viewport, nav becomes opaque
    const sentinel = document.querySelector('[data-hero-sentinel]');
    if (!sentinel) {
      setScrolled(true); // no hero — always opaque
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-74px 0px 0px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
      role="banner"
    >
      <div className={styles.inner}>
        <a href="#" className={styles.logo} aria-label="VELAR Mobile Detailing — home">
          <Image
            src="/velar-logo.png"
            alt="VELAR Mobile Detailing"
            width={120}
            height={116}
            className={styles.logoImg}
            priority
          />
        </a>

        <nav className={styles.links} aria-label="Primary">
          <a href="#" className={styles.link}>Home</a>
          <a href="#pricing" className={styles.link}>Packages</a>
          <a href="#faq" className={styles.link}>FAQ</a>
        </nav>

        <button
          type="button"
          className={styles.bookBtn}
          onClick={() => onBook({})}
        >
          Book Now
        </button>
      </div>
    </header>
  );
}
