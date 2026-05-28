'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { CATEGORIES } from '@/lib/pricing-data';
import { VELAR_PHONE, VELAR_PHONE_DISPLAY } from '@/lib/config';
import styles from './BookingModal.module.css';

/* ─── Public interface — unchanged ─────────────────────────────────────── */
export interface BookingIntent {
  packageName?: string;
  categoryLabel?: string;
  price?: number;
}

interface Props {
  intent: BookingIntent;
  onClose: () => void;
}

/* ─── Internal booking state ────────────────────────────────────────────── */
type VehicleType = 'sedan' | 'suv' | 'xl';

interface BookingState {
  vehicleType: VehicleType | null;
  categoryId: string | null;
  packageId: string | null;
  enhancements: string[];
  preferredDate: string;
  preferredTime: string;
  zip: string;
  vehicleDescription: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

const STEPS = [
  'Vehicle & Package',
  'Add-ons',
  'Date & Time',
  'Location',
  'Vehicle Details',
  'Your Information',
  'Review & Confirm',
] as const;

const TIME_SLOTS = [
  'No preference',
  '8:00 AM – 10:00 AM',
  '10:00 AM – 12:00 PM',
  '12:00 PM – 2:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
];

function buildInitialState(intent: BookingIntent): BookingState {
  let categoryId: string | null = null;
  let packageId: string | null = null;

  if (intent.packageName && intent.categoryLabel) {
    const cat = CATEGORIES.find(c => c.label === intent.categoryLabel);
    if (cat) {
      categoryId = cat.id;
      const pkg = cat.packages.find(p => p.name === intent.packageName);
      if (pkg) packageId = pkg.id;
    }
  }

  return {
    vehicleType: null,
    categoryId,
    packageId,
    enhancements: [],
    preferredDate: '',
    preferredTime: 'No preference',
    zip: '',
    vehicleDescription: '',
    name: '',
    phone: '',
    email: '',
    notes: '',
  };
}

function computePrice(state: BookingState): number | null {
  if (!state.vehicleType || !state.categoryId || !state.packageId) return null;
  const cat = CATEGORIES.find(c => c.id === state.categoryId);
  const pkg = cat?.packages.find(p => p.id === state.packageId);
  if (!pkg) return null;
  return state.vehicleType === 'sedan' ? pkg.price : pkg.xlPrice;
}

function isStepValid(step: number, state: BookingState): boolean {
  switch (step) {
    case 1: return state.vehicleType !== null && state.packageId !== null;
    case 2: return true;
    case 3: return state.preferredDate !== '';
    case 4: return /^\d{5}$/.test(state.zip);
    case 5: return state.vehicleDescription.trim().length > 0;
    case 6: return (
      state.name.trim().length > 0 &&
      state.phone.trim().length >= 7 &&
      /\S+@\S+\.\S+/.test(state.email)
    );
    case 7: return true;
    default: return false;
  }
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function BookingModal({ intent, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [state, setState] = useState<BookingState>(() => buildInitialState(intent));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const todayISO = new Date().toISOString().split('T')[0];

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
    panelRef.current
      ?.querySelector<HTMLElement>('button, input, select, textarea')
      ?.focus();
  }, [step]);

  // Focus trap — prevent Tab/Shift-Tab from escaping the modal
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    function onTab(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      const focusable = Array.from(
        panel!.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.closest('[aria-hidden="true"]'));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onTab);
    return () => document.removeEventListener('keydown', onTab);
  }, []); // runs once; panelRef is stable

  function update(partial: Partial<BookingState>) {
    setState(prev => ({ ...prev, ...partial }));
  }

  function goNext() {
    if (step < 7) setStep(s => s + 1);
  }

  function goBack() {
    if (step > 1) setStep(s => s - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');
    const cat = CATEGORIES.find(c => c.id === state.categoryId);
    const pkg = cat?.packages.find(p => p.id === state.packageId);
    const vehicleTypeLabel =
      state.vehicleType === 'sedan' ? 'Sedan/Coupe' :
      state.vehicleType === 'suv'   ? 'SUV/Truck'   : 'XL Vehicle';

    const noteParts = [state.notes.trim()];
    if (state.enhancements.length > 0) {
      noteParts.push(`Add-ons requested: ${state.enhancements.join(', ')}`);
    }

    const payload = {
      name:           state.name,
      phone:          state.phone,
      email:          state.email,
      vehicle:        `${state.vehicleDescription} (${vehicleTypeLabel})`,
      service:        cat && pkg ? `${cat.label} — ${pkg.name}` : '',
      preferred_date: state.preferredDate,
      preferred_time: state.preferredTime,
      zip:            state.zip,
      notes:          noteParts.filter(Boolean).join('\n\n'),
    };

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error || 'Submission failed');
      }
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please call or text us.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!mounted) return null;

  const price = computePrice(state);
  const cat = CATEGORIES.find(c => c.id === state.categoryId);
  const pkg = cat?.packages.find(p => p.id === state.packageId);

  return createPortal(
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Book a detail"
    >
      <div className={styles.frame} ref={panelRef}>

        {submitted ? (
          <SuccessState onClose={onClose} />
        ) : (
          <>
            {/* ── DARK SIDEBAR ── */}
            <div className={styles.sidebar}>
              <div className={styles.sidebarTop}>
                <div className={styles.sidebarLogo}>
                  <Image
                    src="/velar-logo.png"
                    alt="VELAR Mobile Detailing"
                    width={120}
                    height={116}
                    className={styles.sidebarLogoImg}
                  />
                </div>

                <nav className={styles.stepList} aria-label="Booking steps">
                  {STEPS.map((label, i) => {
                    const n = i + 1;
                    const isActive = n === step;
                    const isDone = n < step;
                    return (
                      <div key={n} className={styles.stepItem}>
                        <div
                          className={[
                            styles.stepRow,
                            isActive ? styles.stepActive : '',
                            isDone   ? styles.stepDone   : '',
                          ].join(' ')}
                        >
                          <div className={styles.stepNum}>{n}</div>
                          <span className={styles.stepName}>{label}</span>
                        </div>
                        {n < STEPS.length && (
                          <div className={styles.stepConnector} />
                        )}
                      </div>
                    );
                  })}
                </nav>
              </div>

              {/* Booking summary */}
              <div className={styles.summary}>
                <div className={styles.summaryHeader}>Booking Summary</div>
                <div className={styles.summaryRow}>
                  <div className={styles.summaryKey}>Service</div>
                  <div className={styles.summaryVal}>
                    {pkg
                      ? pkg.name
                      : <span className={styles.summaryEmpty}>—</span>}
                  </div>
                </div>
                <div className={styles.summaryRow}>
                  <div className={styles.summaryKey}>Vehicle</div>
                  <div className={styles.summaryVal}>
                    {state.vehicleType === 'sedan' ? 'Sedan / Coupe' :
                     state.vehicleType === 'suv'   ? 'SUV / Truck (+$30)' :
                     state.vehicleType === 'xl'    ? 'XL Vehicle (+$30)' :
                     <span className={styles.summaryEmpty}>—</span>}
                  </div>
                </div>
                <div className={styles.summaryTotal}>
                  <div className={styles.summaryTotalKey}>Est. Total</div>
                  {price != null ? (
                    <>
                      <div className={styles.summaryTotalVal}>${price}</div>
                      <div className={styles.summaryTotalNote}>
                        {pkg?.duration} · subject to review
                      </div>
                    </>
                  ) : (
                    <div className={styles.summaryTotalValEmpty}>TBD</div>
                  )}
                </div>
              </div>
            </div>

            {/* ── WHITE STEP PANEL ── */}
            <div className={styles.stepPanel}>
              <div className={styles.progress}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${(step / STEPS.length) * 100}%` }}
                />
              </div>

              <div className={styles.stepContent}>
                <StepContent
                  step={step}
                  state={state}
                  update={update}
                  todayISO={todayISO}
                  timeSlots={TIME_SLOTS}
                  submitError={submitError}
                />
              </div>

              <div className={styles.stepNav}>
                <button
                  className={styles.backBtn}
                  onClick={goBack}
                  type="button"
                  style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
                >
                  ← Back
                </button>
                {step < 7 ? (
                  <button
                    className={styles.continueBtn}
                    onClick={goNext}
                    type="button"
                    disabled={!isStepValid(step, state)}
                  >
                    Continue &nbsp;→
                  </button>
                ) : (
                  <button
                    className={styles.continueBtn}
                    onClick={handleSubmit}
                    type="button"
                    // Guard on step 6 (contact info) — the real required fields.
                    // isStepValid(7) unconditionally returns true; this ensures name/phone/email
                    // are filled before submission even if the user somehow reaches step 7 directly.
                    disabled={submitting || !isStepValid(6, state)}
                  >
                    {submitting ? 'Sending…' : 'Confirm Booking'}
                  </button>
                )}
              </div>

              <button
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Close booking"
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
            </div>
          </>
        )}

      </div>
    </div>,
    document.body
  );
}

/* ─── Step content router ───────────────────────────────────────────────── */
interface StepContentProps {
  step: number;
  state: BookingState;
  update: (partial: Partial<BookingState>) => void;
  todayISO: string;
  timeSlots: string[];
  submitError: string;
}

function StepContent(props: StepContentProps) {
  const { step, state, update, todayISO, timeSlots, submitError } = props;
  switch (step) {
    case 1: return <Step1 state={state} update={update} />;
    case 2: return <Step2 state={state} update={update} />;
    case 3: return <Step3 state={state} update={update} todayISO={todayISO} timeSlots={timeSlots} />;
    case 4: return <Step4 state={state} update={update} />;
    case 5: return <Step5 state={state} update={update} />;
    case 6: return <Step6 state={state} update={update} />;
    case 7: return <Step7 state={state} submitError={submitError} />;
    default: return null;
  }
}

/* ─── Step placeholders (replaced in Tasks 5–8) ────────────────────────── */
function Step1({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
  // Default to first category if none selected yet
  const activeCatId = state.categoryId ?? CATEGORIES[0].id;
  const selectedCat = CATEGORIES.find(c => c.id === activeCatId) ?? CATEGORIES[0];

  function selectCategory(id: string) {
    // Reset package selection when switching category
    update({ categoryId: id, packageId: null });
  }

  return (
    <>
      <span className={styles.stepEye}>Step 1 of 7</span>
      <h3 className={styles.stepHeading}>Your vehicle and service level.</h3>
      <p className={styles.stepSub}>This helps us give you accurate pricing before you confirm.</p>

      {/* Service type toggle */}
      <span className={styles.sublabel}>Service Type</span>
      <div className={styles.catToggle}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            className={[styles.catBtn, activeCatId === cat.id ? styles.catSelected : ''].filter(Boolean).join(' ')}
            onClick={() => selectCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Vehicle size */}
      <span className={styles.sublabel}>Vehicle Size</span>
      <div className={styles.vehicleTypes}>
        {([
          { type: 'sedan', label: 'Sedan / Coupe', icon: '🚗', adj: null  },
          { type: 'suv',   label: 'SUV / Truck',   icon: '🚙', adj: '+$30' },
          { type: 'xl',    label: 'XL Vehicle',    icon: '🚐', adj: '+$30' },
        ] as const).map(({ type, label, icon, adj }) => (
          <div
            key={type}
            role="button"
            tabIndex={0}
            className={[styles.vtCard, state.vehicleType === type ? styles.vtSelected : ''].filter(Boolean).join(' ')}
            aria-pressed={state.vehicleType === type}
            onClick={() => update({ vehicleType: type })}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                update({ vehicleType: type });
              }
            }}
          >
            <span className={styles.vtIcon}>{icon}</span>
            <span className={styles.vtName}>{label}</span>
            {adj && <span className={styles.vtAdj}>{adj}</span>}
          </div>
        ))}
      </div>

      {/* Package selection */}
      <span className={styles.sublabel}>Choose Your Package</span>
      <div className={styles.pkgCols}>
        {selectedCat.packages.map(pkg => {
          const isSelected = state.packageId === pkg.id;
          const displayPrice = state.vehicleType === 'sedan' ? pkg.price : pkg.xlPrice;
          const topFeatures = pkg.features.flatMap(g => g.items).slice(0, 4);

          return (
            <div
              key={pkg.id}
              role="button"
              tabIndex={0}
              className={[
                styles.pkgCard,
                pkg.isFeatured ? styles.pkgFeatured : '',
                isSelected     ? styles.pkgSelected  : '',
              ].filter(Boolean).join(' ')}
              aria-pressed={isSelected}
              onClick={() => update({ packageId: pkg.id, categoryId: selectedCat.id })}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  update({ packageId: pkg.id, categoryId: selectedCat.id });
                }
              }}
            >
              {pkg.isFeatured && (
                <div className={styles.pkgBadge}>Most Popular</div>
              )}
              <div className={styles.pkgTier}>{selectedCat.label}</div>
              <div className={styles.pkgName}>{pkg.name}</div>
              <div className={styles.pkgFeats}>
                {topFeatures.map(f => (
                  <div key={f} className={styles.pkgFeat}>{f}</div>
                ))}
              </div>
              <div className={styles.pkgRule} />
              <div className={styles.pkgPrice}>
                {state.vehicleType ? `$${displayPrice}` : `from $${pkg.price}`}
              </div>
              <div className={styles.pkgDur}>{pkg.duration}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
function Step2({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
  return (
    <div>
      <span className={styles.stepEye}>Step 2 of 7</span>
      <h3 className={styles.stepHeading}>Anything else we can do?</h3>
      <p className={styles.stepSub}>Step content coming in Task 6.</p>
    </div>
  );
}
function Step3({ state, update, todayISO, timeSlots }: { state: BookingState; update: (p: Partial<BookingState>) => void; todayISO: string; timeSlots: string[] }) {
  return (
    <div>
      <span className={styles.stepEye}>Step 3 of 7</span>
      <h3 className={styles.stepHeading}>When works for you?</h3>
      <p className={styles.stepSub}>Step content coming in Task 6.</p>
    </div>
  );
}
function Step4({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
  return (
    <div>
      <span className={styles.stepEye}>Step 4 of 7</span>
      <h3 className={styles.stepHeading}>Where are you located?</h3>
      <p className={styles.stepSub}>Step content coming in Task 6.</p>
    </div>
  );
}
function Step5({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
  return (
    <div>
      <span className={styles.stepEye}>Step 5 of 7</span>
      <h3 className={styles.stepHeading}>Tell us about your vehicle.</h3>
      <p className={styles.stepSub}>Step content coming in Task 7.</p>
    </div>
  );
}
function Step6({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
  return (
    <div>
      <span className={styles.stepEye}>Step 6 of 7</span>
      <h3 className={styles.stepHeading}>How do we reach you?</h3>
      <p className={styles.stepSub}>Step content coming in Task 7.</p>
    </div>
  );
}
function Step7({ state, submitError }: { state: BookingState; submitError: string }) {
  return (
    <div>
      <span className={styles.stepEye}>Step 7 of 7</span>
      <h3 className={styles.stepHeading}>Review your booking.</h3>
      <p className={styles.stepSub}>Step content coming in Task 8.</p>
      {submitError && <p className={styles.errorMsg}>{submitError}</p>}
    </div>
  );
}

/* ─── Success state ─────────────────────────────────────────────────────── */
function SuccessState({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.success}>
      <div className={styles.successInner}>
        <span className={styles.successEye}>Request Received</span>
        <h2 className={styles.successTitle}>We&apos;ll be in touch shortly.</h2>
        <p className={styles.successBody}>
          We typically confirm within 1–2 hours during business hours.
        </p>
        <div className={styles.successActions}>
          <a href={`tel:+1${VELAR_PHONE}`} className={styles.callBtn}>
            Call {VELAR_PHONE_DISPLAY}
          </a>
          <a href={`sms:+1${VELAR_PHONE}`} className={styles.textBtn}>
            Send a Text
          </a>
        </div>
        <button className={styles.doneBtn} onClick={onClose} type="button">
          Done
        </button>
      </div>
    </div>
  );
}
