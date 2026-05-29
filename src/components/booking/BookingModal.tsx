'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { CATEGORIES, ADDON_GROUPS } from '@/lib/pricing-data';
import { ADDON_ICON_MAP } from './AddonIcons';
import { VELAR_PHONE, VELAR_PHONE_DISPLAY } from '@/lib/config';
import styles from './BookingModal.module.css';

/* ─── Public interface ──────────────────────────────────────────────────── */
export interface BookingIntent {
  packageName?: string;
  categoryLabel?: string;
  price?: number;
  /** Pre-filled from the ContactGateModal */
  prefillName?: string;
  prefillPhone?: string;
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

const STEP_TITLES = [
  'Your Vehicle & Service',
  'Optional Add-Ons',
  'Date & Time',
  'Your Location',
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
    name: intent.prefillName ?? '',
    phone: intent.prefillPhone ?? '',
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
    case 3: return state.preferredDate !== '' && state.preferredTime !== 'No preference';
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

  function update(partial: Partial<BookingState> | ((prev: BookingState) => Partial<BookingState>)) {
    setState(prev => ({
      ...prev,
      ...(typeof partial === 'function' ? partial(prev) : partial),
    }));
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
                    width={1238}
                    height={1194}
                    className={styles.sidebarLogoImg}
                  />
                </div>
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

              {/* Step indicator — replaces sidebar step list */}
              <div className={styles.stepIndicator}>
                <span className={styles.stepCount}>
                  Step {step} of {STEPS.length}
                </span>
                <h2 className={styles.stepTitle}>
                  {STEP_TITLES[step - 1]}
                </h2>
                <div className={styles.progress}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${(step / STEPS.length) * 100}%` }}
                  />
                </div>
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
                <div className={styles.stepNavRight}>
                  {step === 7 && submitError && (
                    <p className={styles.errorMsg} style={{ textAlign: 'right', marginBottom: 8 }}>
                      {submitError}
                    </p>
                  )}
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
  update: (partial: Partial<BookingState> | ((prev: BookingState) => Partial<BookingState>)) => void;
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
function Step1({ state, update }: { state: BookingState; update: (partial: Partial<BookingState> | ((prev: BookingState) => Partial<BookingState>)) => void }) {
  // Default to first category if none selected yet
  const activeCatId = state.categoryId ?? CATEGORIES[0].id;
  const selectedCat = CATEGORIES.find(c => c.id === activeCatId) ?? CATEGORIES[0];

  function selectCategory(id: string) {
    // Reset package selection when switching category
    update({ categoryId: id, packageId: null });
  }

  return (
    <>
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
function Step2({ state, update }: { state: BookingState; update: (partial: Partial<BookingState> | ((prev: BookingState) => Partial<BookingState>)) => void }) {
  function toggleEnhancement(name: string) {
    update(prev => ({
      enhancements: prev.enhancements.includes(name)
        ? prev.enhancements.filter(e => e !== name)
        : [...prev.enhancements, name],
    }));
  }

  // Running subtotal calculation
  const basePrice = computePrice(state);
  const addonSum = state.enhancements.reduce((sum, name) => {
    for (const group of ADDON_GROUPS) {
      const item = group.items.find(i => i.name === name);
      if (item?.numericPrice != null) return sum + item.numericPrice;
    }
    return sum;
  }, 0);
  const hasNonNumericSelected = state.enhancements.some(name => {
    for (const group of ADDON_GROUPS) {
      const item = group.items.find(i => i.name === name);
      if (item && item.numericPrice == null) return true;
    }
    return false;
  });

  return (
    <>
      <p className={styles.stepSub}>
        Customize your service with optional upgrades. Skip anything that doesn&apos;t apply.
      </p>

      {/* Premium add-on service menu */}
      {ADDON_GROUPS.map((group, gi) => (
        <div
          key={group.groupLabel}
          className={styles.addonSection}
          style={{ animationDelay: `${gi * 55}ms` }}
        >
          <span className={styles.addonSectionHeader}>{group.groupLabel}</span>

          {group.items.map(item => {
            const isSelected = state.enhancements.includes(item.name);
            const IconComponent = ADDON_ICON_MAP[item.iconId];

            return (
              <div
                key={item.name}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                className={[
                  styles.addonRow,
                  isSelected ? styles.addonRowSelected : '',
                ].filter(Boolean).join(' ')}
                onClick={() => toggleEnhancement(item.name)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleEnhancement(item.name);
                  }
                }}
              >
                {/* Icon */}
                <div className={styles.addonIconWrap}>
                  {IconComponent && <IconComponent />}
                </div>

                {/* Name + description */}
                <div className={styles.addonInfo}>
                  <span className={styles.addonName}>{item.name}</span>
                  <span className={styles.addonDesc}>{item.description}</span>
                </div>

                {/* Price */}
                {item.numericPrice != null ? (
                  <span className={styles.addonPrice}>{item.price}</span>
                ) : (
                  <span className={styles.addonPriceContact}>{item.price}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Running subtotal */}
      {basePrice != null && (
        <div className={styles.addonSubtotal}>
          <div className={styles.addonSubtotalRow}>
            <span className={styles.addonSubtotalKey}>Base Package</span>
            <span className={styles.addonSubtotalVal}>${basePrice}</span>
          </div>
          <div className={styles.addonSubtotalRow}>
            <span className={styles.addonSubtotalKey}>Selected Add-ons</span>
            <span className={styles.addonSubtotalVal}>
              {addonSum > 0 ? `+$${addonSum}` : '—'}
            </span>
          </div>
          <div className={styles.addonSubtotalDivider} />
          <div className={styles.addonSubtotalTotalRow}>
            <span className={styles.addonSubtotalTotalKey}>Estimated Total</span>
            {/* key change re-triggers the pulse animation on every update */}
            <span
              key={basePrice + addonSum}
              className={styles.addonSubtotalTotalVal}
            >
              ${basePrice + addonSum}
            </span>
          </div>
          {hasNonNumericSelected && (
            <p className={styles.addonSubtotalNote}>
              * Some selected services require a custom quote and aren&apos;t reflected above.
            </p>
          )}
        </div>
      )}
    </>
  );
}
const ARRIVAL_WINDOWS = [
  { label: 'Morning',    window: '8:00 AM – 10:00 AM',  note: 'Early start'      },
  { label: 'Midday',     window: '12:00 PM – 2:00 PM',  note: 'Midday arrival'   },
  { label: 'Afternoon',  window: '3:00 PM – 5:00 PM',   note: 'Late afternoon'   },
] as const;

const CAL_MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const CAL_DAY_LABELS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

function Step3({
  state,
  update,
  todayISO,
}: {
  state: BookingState;
  update: (partial: Partial<BookingState> | ((prev: BookingState) => Partial<BookingState>)) => void;
  todayISO: string;
  timeSlots: string[]; // kept in signature for interface compatibility
}) {
  // Initialise calendar to the selected month (if already chosen) or current month
  const [calYear, setCalYear] = useState<number>(() =>
    state.preferredDate ? parseInt(state.preferredDate.slice(0, 4), 10) : parseInt(todayISO.slice(0, 4), 10)
  );
  const [calMonth, setCalMonth] = useState<number>(() =>
    state.preferredDate ? parseInt(state.preferredDate.slice(5, 7), 10) - 1 : parseInt(todayISO.slice(5, 7), 10) - 1
  );

  // ── Calendar navigation ──────────────────────────────────────────────────
  const todayYear = parseInt(todayISO.slice(0, 4), 10);
  const todayMonthIdx = parseInt(todayISO.slice(5, 7), 10) - 1;
  const canGoPrev = !(calYear === todayYear && calMonth === todayMonthIdx);

  function prevMonth() {
    if (!canGoPrev) return;
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  // ── Date helpers ─────────────────────────────────────────────────────────
  function toISO(day: number): string {
    return `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  function isCellDisabled(day: number): boolean {
    return toISO(day) < todayISO; // ISO lexicographic comparison
  }
  function isCellToday(day: number): boolean {
    return toISO(day) === todayISO;
  }

  function selectDate(day: number) {
    if (isCellDisabled(day)) return;
    const iso = toISO(day);
    // Clear arrival window if date changes so the user must re-confirm
    update({ preferredDate: iso, preferredTime: iso !== state.preferredDate ? 'No preference' : state.preferredTime });
  }

  // ── Build grid cells ─────────────────────────────────────────────────────
  const firstDayOfWeek = (new Date(calYear, calMonth, 1).getDay() + 6) % 7; // Mon = 0
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array<null>(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // ── Display helpers ──────────────────────────────────────────────────────
  function formatDisplayDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  }

  const dateSelected = state.preferredDate !== '';
  const timeSelected = state.preferredTime !== 'No preference';

  // ── Booking context ──────────────────────────────────────────────────────
  const cat = CATEGORIES.find(c => c.id === state.categoryId);
  const pkg = cat?.packages.find(p => p.id === state.packageId);
  const price = computePrice(state);
  const vehicleLabel =
    state.vehicleType === 'sedan' ? 'Sedan / Coupe' :
    state.vehicleType === 'suv'   ? 'SUV / Truck'   :
    state.vehicleType === 'xl'    ? 'XL Vehicle'     : null;

  return (
    <>
      <p className={styles.stepSub}>
        Choose your preferred date and arrival window. We&apos;ll confirm availability by text.
      </p>

      {/* Booking context card */}
      {pkg && (
        <div className={styles.dtSummary}>
          <div className={styles.dtSummaryLeft}>
            <span className={styles.dtSummaryPkg}>{pkg.name}</span>
            {vehicleLabel && <span className={styles.dtSummaryVehicle}>{vehicleLabel}</span>}
            {dateSelected && (
              <span className={styles.dtSummarySchedule}>
                {formatDisplayDate(state.preferredDate)}
                {timeSelected && <> &nbsp;·&nbsp; {state.preferredTime}</>}
              </span>
            )}
          </div>
          {price != null && <span className={styles.dtSummaryPrice}>${price}</span>}
        </div>
      )}

      {/* ── Custom calendar ── */}
      <div className={styles.calendar}>

        {/* Month navigation */}
        <div className={styles.calHeader}>
          <button
            className={styles.calNav}
            type="button"
            onClick={prevMonth}
            disabled={!canGoPrev}
            aria-label="Previous month"
          >
            ←
          </button>
          <span className={styles.calMonthLabel}>
            {CAL_MONTH_NAMES[calMonth]} {calYear}
          </span>
          <button
            className={styles.calNav}
            type="button"
            onClick={nextMonth}
            aria-label="Next month"
          >
            →
          </button>
        </div>

        {/* Day-of-week headers + date grid */}
        <div className={styles.calGrid}>
          {CAL_DAY_LABELS.map(d => (
            <div key={d} className={styles.calDayLabel}>{d}</div>
          ))}
          {cells.map((day, i) => {
            if (day === null) return <div key={`e${i}`} />;
            const iso = toISO(day);
            const disabled = isCellDisabled(day);
            const selected = state.preferredDate === iso;
            const isToday = isCellToday(day);
            return (
              <button
                key={iso}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                aria-label={`${CAL_MONTH_NAMES[calMonth]} ${day}`}
                className={[
                  styles.calCell,
                  disabled ? styles.calCellDisabled : '',
                  selected ? styles.calCellSelected : '',
                  isToday && !selected ? styles.calCellToday : '',
                ].filter(Boolean).join(' ')}
                onClick={() => selectDate(day)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Arrival windows ── */}
      <div className={[
        styles.timeSlotSection,
        !dateSelected ? styles.timeSlotSectionLocked : '',
      ].filter(Boolean).join(' ')}>
        <span className={styles.timeSlotSectionLabel}>
          {dateSelected
            ? `Arrival Window — ${formatDisplayDate(state.preferredDate)}`
            : 'Arrival Window — select a date above'}
        </span>
        <div className={styles.timeSlotGrid}>
          {ARRIVAL_WINDOWS.map(slot => {
            const isSelected = state.preferredTime === slot.window;
            return (
              <div
                key={slot.label}
                role="button"
                tabIndex={dateSelected ? 0 : -1}
                aria-pressed={isSelected}
                aria-disabled={!dateSelected}
                className={[
                  styles.timeSlotCard,
                  isSelected ? styles.timeSlotSelected : '',
                  !dateSelected ? styles.timeSlotCardDisabled : '',
                ].filter(Boolean).join(' ')}
                onClick={() => { if (dateSelected) update({ preferredTime: slot.window }); }}
                onKeyDown={e => {
                  if (dateSelected && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    update({ preferredTime: slot.window });
                  }
                }}
              >
                <span className={styles.timeSlotLabel}>{slot.label}</span>
                <span className={styles.timeSlotWindow}>{slot.window}</span>
                <span className={styles.timeSlotNote}>{slot.note}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
function Step4({ state, update }: { state: BookingState; update: (partial: Partial<BookingState> | ((prev: BookingState) => Partial<BookingState>)) => void }) {
  return (
    <>
      <p className={styles.stepSub}>We serve Dallas and surrounding areas. Enter your ZIP to confirm we cover your area.</p>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="bk-zip">
          ZIP Code
        </label>
        <input
          className={styles.fieldInput}
          id="bk-zip"
          name="zip"
          type="text"
          required
          placeholder="75201"
          inputMode="numeric"
          maxLength={5}
          value={state.zip}
          onChange={e => update({ zip: e.target.value.replace(/\D/g, '').slice(0, 5) })}
        />
      </div>
    </>
  );
}
function Step5({ state, update }: { state: BookingState; update: (partial: Partial<BookingState> | ((prev: BookingState) => Partial<BookingState>)) => void }) {
  return (
    <>
      <p className={styles.stepSub}>Year, make, and model help us arrive prepared with the right products.</p>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="bk-vehicle">
          Year, Make, Model
        </label>
        <input
          className={styles.fieldInput}
          id="bk-vehicle"
          name="vehicle"
          type="text"
          required
          placeholder="e.g. 2022 BMW X5"
          value={state.vehicleDescription}
          onChange={e => update({ vehicleDescription: e.target.value })}
        />
      </div>
    </>
  );
}
function Step6({ state, update }: { state: BookingState; update: (partial: Partial<BookingState> | ((prev: BookingState) => Partial<BookingState>)) => void }) {
  return (
    <>
      <p className={styles.stepSub}>We&apos;ll confirm and coordinate your appointment via phone or email.</p>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="bk-name">
            Full Name
          </label>
          <input
            className={styles.fieldInput}
            id="bk-name"
            name="name"
            type="text"
            required
            placeholder="Your name"
            autoComplete="name"
            value={state.name}
            onChange={e => update({ name: e.target.value })}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="bk-phone">
            Phone
          </label>
          <input
            className={styles.fieldInput}
            id="bk-phone"
            name="phone"
            type="tel"
            required
            placeholder="(214) 555-0000"
            autoComplete="tel"
            inputMode="tel"
            value={state.phone}
            onChange={e => update({ phone: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="bk-email">
          Email Address
        </label>
        <input
          className={styles.fieldInput}
          id="bk-email"
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          autoComplete="email"
          inputMode="email"
          value={state.email}
          onChange={e => update({ email: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="bk-notes">
          Notes{' '}
          <span className={styles.fieldLabelOptional}>
            (optional)
          </span>
        </label>
        <textarea
          className={styles.fieldTextarea}
          id="bk-notes"
          name="notes"
          placeholder="Vehicle condition, gate codes, location details, anything helpful…"
          rows={3}
          value={state.notes}
          onChange={e => update({ notes: e.target.value })}
        />
      </div>
    </>
  );
}
function Step7({ state, submitError }: { state: BookingState; submitError: string }) {
  const cat = CATEGORIES.find(c => c.id === state.categoryId);
  const pkg = cat?.packages.find(p => p.id === state.packageId);
  const price = computePrice(state);
  const vehicleLabel =
    state.vehicleType === 'sedan' ? 'Sedan / Coupe' :
    state.vehicleType === 'suv'   ? 'SUV / Truck'   :
    state.vehicleType === 'xl'    ? 'XL Vehicle'     : '—';

  return (
    <>
      <p className={styles.stepSub}>Confirm the details below. We&apos;ll be in touch to finalize.</p>

      {/* Service */}
      <div className={styles.reviewSection}>
        <span className={styles.reviewSectionLabel}>Service</span>
        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Package</span>
          <span className={styles.reviewVal}>
            {cat && pkg ? `${cat.label} — ${pkg.name}` : '—'}
          </span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Vehicle size</span>
          <span className={styles.reviewVal}>{vehicleLabel}</span>
        </div>
        {state.enhancements.length > 0 && (
          <div className={styles.reviewRow}>
            <span className={styles.reviewKey}>Add-ons</span>
            <span className={styles.reviewVal}>{state.enhancements.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Schedule */}
      <div className={styles.reviewSection}>
        <span className={styles.reviewSectionLabel}>Schedule</span>
        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Date</span>
          <span className={styles.reviewVal}>{state.preferredDate || '—'}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Time</span>
          <span className={styles.reviewVal}>{state.preferredTime}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>ZIP</span>
          <span className={styles.reviewVal}>{state.zip}</span>
        </div>
      </div>

      {/* Contact */}
      <div className={styles.reviewSection}>
        <span className={styles.reviewSectionLabel}>Contact</span>
        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Name</span>
          <span className={styles.reviewVal}>{state.name}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Phone</span>
          <span className={styles.reviewVal}>{state.phone}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Email</span>
          <span className={styles.reviewVal}>{state.email}</span>
        </div>
        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Vehicle</span>
          <span className={styles.reviewVal}>{state.vehicleDescription}</span>
        </div>
      </div>

      {/* Estimated total */}
      {price != null && (
        <div className={styles.reviewTotalRow}>
          <span className={styles.reviewTotalKey}>Estimated Total</span>
          <span className={styles.reviewTotalVal}>${price}</span>
        </div>
      )}

    </>
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
