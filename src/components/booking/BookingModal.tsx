'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CATEGORIES } from '@/lib/pricing-data';
import { VELAR_PHONE, VELAR_PHONE_DISPLAY, FORMSPREE_ID } from '@/lib/config';
import styles from './BookingModal.module.css';

export interface BookingIntent {
  packageName?: string;
  categoryLabel?: string;
  price?: number;
}

interface Props {
  intent: BookingIntent;
  onClose: () => void;
}

const TIME_SLOTS = [
  'No preference',
  '8:00 AM – 10:00 AM',
  '10:00 AM – 12:00 PM',
  '12:00 PM – 2:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
];

// Build service options from pricing data so they stay in sync automatically
const SERVICE_OPTIONS = [
  ...CATEGORIES.flatMap((cat) =>
    cat.packages.map((pkg) => `${cat.label} — ${pkg.name}`)
  ),
  'Not sure yet — contact me',
];

export default function BookingModal({ intent, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const defaultService =
    intent.packageName && intent.categoryLabel
      ? `${intent.categoryLabel} — ${intent.packageName}`
      : '';

  const todayISO = new Date().toISOString().split('T')[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll; restore on unmount
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Trap focus inside panel
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const focusable = el.querySelectorAll<HTMLElement>(
      'button, input, select, textarea, a[href]'
    );
    focusable[0]?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const data = new FormData(e.currentTarget);

    try {
      if (FORMSPREE_ID) {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error();
      } else {
        // No endpoint configured — simulate a successful send in dev
        await new Promise((r) => setTimeout(r, 600));
      }
      setSubmitted(true);
    } catch {
      setError(
        'Something went wrong. Please call or text us and we\'ll get you booked.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Book a detail"
    >
      <div className={styles.panel} ref={panelRef}>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="Close booking form"
          type="button"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
            <path
              d="M1 1l11 11M12 1L1 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {submitted ? (
          <SuccessState onClose={onClose} />
        ) : (
          <>
            <div className={styles.header}>
              <div className={styles.headerRule} aria-hidden="true" />
              <span className={styles.eyebrow}>VELAR · Dallas, TX</span>
              <h2 className={styles.title}>Book Your Detail</h2>
              <p className={styles.subtitle}>
                We'll confirm availability and reach out to schedule.
              </p>
            </div>

            <form
              className={styles.form}
              onSubmit={handleSubmit}
              noValidate
              // key resets uncontrolled fields when a different package triggers the modal
              key={defaultService}
            >
              <div className={styles.row}>
                <Field label="Name" htmlFor="bk-name">
                  <input
                    className={styles.input}
                    id="bk-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </Field>
                <Field label="Phone" htmlFor="bk-phone">
                  <input
                    className={styles.input}
                    id="bk-phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="(214) 555-0000"
                    autoComplete="tel"
                    inputMode="tel"
                  />
                </Field>
              </div>

              <Field label="Vehicle" htmlFor="bk-vehicle">
                <input
                  className={styles.input}
                  id="bk-vehicle"
                  name="vehicle"
                  type="text"
                  required
                  placeholder="Year, Make, Model  (e.g. 2022 BMW X5 — truck/SUV adds $30)"
                />
              </Field>

              <Field label="Service Needed" htmlFor="bk-service">
                <select
                  className={styles.select}
                  id="bk-service"
                  name="service"
                  required
                  defaultValue={defaultService}
                >
                  <option value="" disabled>
                    Select a service
                  </option>
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </Field>

              <div className={styles.row}>
                <Field label="Preferred Date" htmlFor="bk-date">
                  <input
                    className={styles.input}
                    id="bk-date"
                    name="preferred_date"
                    type="date"
                    required
                    min={todayISO}
                  />
                </Field>
                <Field label="Preferred Time" htmlFor="bk-time">
                  <select
                    className={styles.select}
                    id="bk-time"
                    name="preferred_time"
                    defaultValue="No preference"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="ZIP Code" htmlFor="bk-zip">
                <input
                  className={styles.input}
                  id="bk-zip"
                  name="zip"
                  type="text"
                  required
                  placeholder="75201"
                  inputMode="numeric"
                  maxLength={5}
                  pattern="[0-9]{5}"
                />
              </Field>

              <Field
                label="Notes"
                htmlFor="bk-notes"
                optional
              >
                <textarea
                  className={styles.textarea}
                  id="bk-notes"
                  name="notes"
                  placeholder="Vehicle condition, location details, anything helpful…"
                  rows={3}
                />
              </Field>

              {error && <p className={styles.error}>{error}</p>}

              <button
                className={styles.submitBtn}
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Sending…' : 'Request Booking'}
              </button>

              <div className={styles.divider} aria-hidden="true">
                <span className={styles.dividerText}>or reach us directly</span>
              </div>

              <div className={styles.directRow}>
                <a
                  href={`tel:+1${VELAR_PHONE}`}
                  className={styles.directLink}
                >
                  <PhoneIcon />
                  Call {VELAR_PHONE_DISPLAY}
                </a>
                <a
                  href={`sms:+1${VELAR_PHONE}`}
                  className={styles.directLink}
                >
                  <TextIcon />
                  Send a Text
                </a>
              </div>
            </form>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
        {optional && <span className={styles.optional}> (optional)</span>}
      </label>
      {children}
    </div>
  );
}

function SuccessState({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.success}>
      <div className={styles.successRule} aria-hidden="true" />
      <span className={styles.eyebrow}>Request Received</span>
      <h2 className={styles.title}>We&apos;ll be in touch shortly.</h2>
      <p className={styles.successBody}>
        We typically confirm within 1–2 hours during business hours.
        <br />
        Need to reach us faster?
      </p>
      <div className={styles.successActions}>
        <a
          href={`tel:+1${VELAR_PHONE}`}
          className={styles.callBtn}
        >
          <PhoneIcon />
          Call {VELAR_PHONE_DISPLAY}
        </a>
        <a
          href={`sms:+1${VELAR_PHONE}`}
          className={styles.textBtn}
        >
          <TextIcon />
          Send a Text
        </a>
      </div>
      <button className={styles.doneBtn} onClick={onClose} type="button">
        Done
      </button>
    </div>
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
