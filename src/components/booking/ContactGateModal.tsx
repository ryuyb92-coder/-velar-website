'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import type { BookingIntent } from './BookingModal';
import styles from './ContactGateModal.module.css';

interface Props {
  intent: BookingIntent;
  onContinue: (phone: string, name: string) => void;
  onClose: () => void;
}

export default function ContactGateModal({ onContinue, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [smsConsent, setSmsConsent] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const phoneDigits = phone.replace(/\D/g, '');
  const canContinue = phoneDigits.length >= 7 && smsConsent;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    panelRef.current?.querySelector<HTMLElement>('input')?.focus();
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Start your booking"
    >
      <div className={styles.panel} ref={panelRef}>

        <button
          className={styles.closeBtn}
          onClick={onClose}
          type="button"
          aria-label="Close"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* VELAR logo */}
        <div className={styles.logoWrap}>
          <Image
            src="/velar-logo-white.png"
            alt="VELAR Mobile Detailing"
            width={1774}
            height={887}
            className={styles.logo}
            priority
          />
        </div>

        <div className={styles.header}>
          <h2 className={styles.heading}>Reserve your detail.</h2>
          <p className={styles.sub}>
            Enter your number and we&apos;ll confirm your booking via text.
          </p>
        </div>

        <div className={styles.form}>

          {/* Phone — required */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="gate-phone">
              Mobile Number <span className={styles.req}>*</span>
            </label>
            <input
              className={styles.input}
              id="gate-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(214) 555-0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              required
            />
          </div>

          {/* Name — optional */}
          <div className={styles.field}>
            <label className={styles.label} htmlFor="gate-name">
              Your Name{' '}
              <span className={styles.optional}>(optional)</span>
            </label>
            <input
              className={styles.input}
              id="gate-name"
              type="text"
              autoComplete="given-name"
              placeholder="First name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

          {/* SMS consent */}
          <label className={styles.consentRow}>
            <input
              className={styles.checkbox}
              type="checkbox"
              checked={smsConsent}
              onChange={e => setSmsConsent(e.target.checked)}
            />
            <span className={styles.consentText}>
              I agree to receive appointment confirmations and service updates via SMS from VELAR Mobile Detailing. Message &amp; data rates may apply. Reply STOP to opt out.
            </span>
          </label>

          {/* CTA */}
          <button
            className={styles.continueBtn}
            type="button"
            disabled={!canContinue}
            onClick={() => onContinue(phone, name)}
          >
            Continue &nbsp;→
          </button>

        </div>
      </div>
    </div>,
    document.body
  );
}
