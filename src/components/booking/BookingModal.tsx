'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { CATEGORIES, ADDON_GROUPS } from '@/lib/pricing-data';
import { ADDON_ICON_MAP } from './AddonIcons';
import { VELAR_PHONE, VELAR_PHONE_DISPLAY, MAPS_API_KEY } from '@/lib/config';
// next/script removed — manual script injection used instead (reliable inside createPortal)
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
  zip: string;              // stores full service address (sent to Notion "Service Address" column)
  accessNotes: string;      // gate code, parking info — merged into notes on submit
  vehicleDescription: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
}

// Location is now the address pre-step (Phase 1), not counted in the booking steps
const STEPS = [
  'Vehicle & Package',  // 1
  'Add-Ons',            // 2
  'Date & Time',        // 3
  'Vehicle Details',    // 4
  'Your Information',   // 5
  'Review & Confirm',   // 6
] as const;

const STEP_TITLES = [
  'Your Vehicle & Service', // 1
  'Optional Add-Ons',       // 2
  'Date & Time',            // 3
  'Vehicle Details',        // 4
  'Your Information',       // 5
  'Review & Confirm',       // 6
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
    accessNotes: '',
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
    case 2: return true;   // add-ons always skippable
    case 3: return state.preferredDate !== '' && state.preferredTime !== 'No preference';
    case 4: return state.vehicleDescription.trim().length > 0;
    case 5: return (
      state.name.trim().length > 0 &&
      state.phone.trim().length >= 7 &&
      /\S+@\S+\.\S+/.test(state.email)
    );
    case 6: return true;
    default: return false;
  }
}

/* ─── Custom map styles ───────────────────────────────────────────────────── */
// SHWASH analysis: uses near-default Google Maps. Premium feel = full-screen
// presentation, not heavy styling. Strategy: keep default appearance, remove
// noise (POIs, transit, local labels, neighborhood names).
/* eslint-disable @typescript-eslint/no-explicit-any */
const VELAR_MAP_STYLES: Record<string, any>[] = [

  // ── POI — remove all business clutter, keep parks ──────────────────────────
  { featureType: 'poi',                 elementType: 'labels',           stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business',        stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.attraction',      stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.medical',         stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.school',          stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.sports_complex',  stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.government',      stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.place_of_worship',stylers: [{ visibility: 'off' }] },
  // Parks: keep geometry (green areas look good), remove their labels
  { featureType: 'poi.park',            elementType: 'labels',           stylers: [{ visibility: 'off' }] },

  // ── Transit — remove entirely ───────────────────────────────────────────────
  { featureType: 'transit',             stylers: [{ visibility: 'off' }] },

  // ── Road labels — local roads have no labels; arterials are simplified ──────
  { featureType: 'road.local',          elementType: 'labels',           stylers: [{ visibility: 'off' }] },
  { featureType: 'road.arterial',       elementType: 'labels',           stylers: [{ visibility: 'simplified' }] },

  // ── Administrative — hide granular neighborhood/parcel names ────────────────
  { featureType: 'administrative.neighborhood',  stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.land_parcel',   stylers: [{ visibility: 'off' }] },

  // ── Land — soft warm light (matches SHWASH default-style appearance) ────────
  { featureType: 'landscape',           elementType: 'geometry',         stylers: [{ color: '#f4f1ec' }] },
  { featureType: 'landscape.man_made',  elementType: 'geometry',         stylers: [{ color: '#f7f4ef' }] },

  // ── Water — soft blue, matches SHWASH ──────────────────────────────────────
  { featureType: 'water',               elementType: 'geometry',         stylers: [{ color: '#b8d4e8' }] },
  { featureType: 'water',               elementType: 'labels.text.fill', stylers: [{ color: '#6a9abf' }] },
  { featureType: 'water',               elementType: 'labels.text.stroke',stylers: [{ color: '#ffffff' }] },
];
/* eslint-enable @typescript-eslint/no-explicit-any */

const DALLAS_CENTER = { lat: 32.7767, lng: -96.7970 };

/* ─── Main component ────────────────────────────────────────────────────── */
export default function BookingModal({ intent, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<'address' | 'booking'>('address');
  const [step, setStep] = useState(1);
  const [state, setState] = useState<BookingState>(() => buildInitialState(intent));
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [mapsReady, setMapsReady] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markerRef = useRef<any>(null);
  // Stores the google.maps.LatLng of the selected address so we can re-center after layout changes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectedLocRef = useRef<any>(null);
  const todayISO = new Date().toISOString().split('T')[0];

  useEffect(() => { setMounted(true); }, []);

  // Load Google Maps JS API via direct script injection — reliable inside createPortal.
  // next/script onLoad does not fire reliably when rendered inside a portal.
  useEffect(() => {
    if (!MAPS_API_KEY) return;

    // Already loaded
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).google?.maps) {
      setMapsReady(true);
      return;
    }

    // Avoid duplicate script tags
    const SCRIPT_ID = 'velar-gmaps';
    if (document.getElementById(SCRIPT_ID)) {
      // Script is loading — wait for it
      const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement;
      const onLoad = () => setMapsReady(true);
      existing.addEventListener('load', onLoad);
      return () => existing.removeEventListener('load', onLoad);
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    // No &loading=async — that parameter causes script.onload to fire before
    // window.google.maps is ready, so the map init effect silently exits.
    // script.async (HTML attribute) is sufficient for non-blocking load.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => setMapsReady(true);
    document.head.appendChild(script);
    // Do not remove on unmount — it's a global resource
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Escape intentionally does NOT close the modal during active booking.
  // Users exit via Back (and backing out of Step 1) or by completing the flow.

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

  // When booking phase begins, re-center the map after the panel animation completes.
  // Runs after a delay so layout has settled, then: resize → panTo → offset left.
  useEffect(() => {
    if (phase !== 'booking' || !mapRef.current) return;
    if (typeof window === 'undefined' || window.innerWidth <= 767) return; // mobile: panel is full-width

    // Panel slide-in animation is 420ms. Wait for it to complete before re-centering.
    const timer = setTimeout(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const g = (window as any).google;
      if (!mapRef.current) return;

      // Tell Google Maps to re-evaluate its container
      if (g?.maps?.event) {
        g.maps.event.trigger(mapRef.current, 'resize');
      }

      // Re-center on the stored selected location
      if (selectedLocRef.current) {
        // Explicitly set zoom so it's correct regardless of prior state
        mapRef.current.setZoom(15);
        mapRef.current.panTo(selectedLocRef.current);

        // panBy sign convention: positive x moves camera EAST (right), which makes
        // the pin appear to move WEST (left) on screen — toward the visible left area.
        // The panel covers the RIGHT 40%, so we shift the camera right by half the
        // panel width, pushing the pin into the center of the visible left area.
        const panelWidth = Math.max(380, window.innerWidth * 0.4);
        mapRef.current.panBy(panelWidth / 2, 0);
      }
    }, 450); // 30ms buffer after the 420ms panel animation

    return () => clearTimeout(timer);
  }, [phase]);

  // Initialize the JS API map once Maps is loaded
  useEffect(() => {
    if (!mapsReady) return;
    console.log('[VELAR Maps] API loaded, mapsReady=true');

    if (!mapContainerRef.current) {
      console.warn('[VELAR Maps] mapContainerRef is null — map div not in DOM yet');
      return;
    }
    if (mapRef.current) {
      console.log('[VELAR Maps] map already initialized, skipping');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    if (!g?.maps?.Map) {
      console.warn('[VELAR Maps] google.maps.Map not available after onload — check loading=async URL param');
      return;
    }

    console.log('[VELAR Maps] creating map in container', mapContainerRef.current);
    mapRef.current = new g.maps.Map(mapContainerRef.current, {
      center: DALLAS_CENTER,
      zoom: 15,  // neighborhood-level — address and nearby streets clearly visible
      styles: VELAR_MAP_STYLES,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      clickableIcons: false,
      gestureHandling: 'cooperative',
    });
    console.log('[VELAR Maps] map created, center:', mapRef.current.getCenter()?.toJSON());
  }, [mapsReady]);

  // Attach Google Places Autocomplete — adds geometry field for smooth map animation
  useEffect(() => {
    if (!mapsReady || !addressInputRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (window as any).google;
    if (!g?.maps?.places?.Autocomplete) return;

    const ac = new g.maps.places.Autocomplete(addressInputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' },
      fields: ['formatted_address', 'geometry'],
    });
    const listener = ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (place.formatted_address) {
        setState(prev => ({ ...prev, zip: place.formatted_address ?? '' }));

        // Store location for re-centering when the booking panel opens
        const loc = place.geometry?.location;
        if (loc) selectedLocRef.current = loc;

        // Pan to selected address — no zoom change, keep address-level view
        if (loc && mapRef.current) {
          mapRef.current.panTo(loc);

          // Drop/move the marker
          if (markerRef.current) markerRef.current.setMap(null);
          markerRef.current = new g.maps.Marker({
            position: loc,
            map: mapRef.current,
            animation: g.maps.Animation.DROP,
          });
        }
      }
    });
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).google?.maps?.event?.removeListener?.(listener);
    };
  }, [mapsReady]);

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

    const noteParts = [
      state.accessNotes.trim() ? `Access Notes: ${state.accessNotes.trim()}` : '',
      state.notes.trim(),
      state.enhancements.length > 0 ? `Add-ons requested: ${state.enhancements.join(', ')}` : '',
    ];

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
  const cat   = CATEGORIES.find(c => c.id === state.categoryId);
  const pkg   = cat?.packages.find(p => p.id === state.packageId);
  const vehicleLabel =
    state.vehicleType === 'sedan' ? 'Sedan / Coupe' :
    state.vehicleType === 'suv'   ? 'SUV / Truck (+$30)' :
    state.vehicleType === 'xl'    ? 'XL Vehicle (+$30)' : null;

  const addressValid = state.zip.trim().length >= 10;

  const PinIcon = (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 1.5C6.1 1.5 3.75 3.85 3.75 6.75C3.75 10.875 9 16.5 9 16.5C9 16.5 14.25 10.875 14.25 6.75C14.25 3.85 11.9 1.5 9 1.5Z"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="6.75" r="1.75" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );

  /* ── Single persistent portal — map container always mounted ───────────── */
  return createPortal(
    <div
      className={styles.bookingRoot}
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={phase === 'address' ? 'Enter service address' : 'Book a detail'}
    >
      {/* Map container — ALWAYS MOUNTED so the map persists across phases */}
      <div ref={mapContainerRef} className={styles.mapContainer} />

      {/* Fallback atmosphere — shown when no API key */}
      {!MAPS_API_KEY && <div className={styles.mapAtmosphere} />}

      {/* ── PHASE 1: Address selection overlay ───────────────────────────── */}
      {phase === 'address' && (
        <>
          {/* White glass card — logo + headline + search */}
          <div className={styles.addressTopCard}>
            <div className={styles.addressTopRow}>
              <Image
                src="/velar-logo.png"
                alt="VELAR Mobile Detailing"
                width={1238}
                height={1194}
                className={styles.addressLogo}
                priority
              />
              <button
                className={styles.addressCancelBtn}
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
            </div>

            <h1 className={styles.addressHeadline}>
              Let&apos;s Schedule Your Appointment
            </h1>

            <div className={styles.addressSearchRow}>
              <div className={styles.addressSearchIcon}>{PinIcon}</div>
              <input
                ref={addressInputRef}
                className={styles.addressSearchInput}
                id="phase1-address"
                type="text"
                placeholder="400 Crescent Ct, Dallas, TX 75201"
                value={state.zip}
                onChange={e => update({ zip: e.target.value })}
                autoComplete="street-address"
                aria-label="Service address"
              />
            </div>
          </div>

          {/* Next button — bottom center */}
          <div className={styles.addressContinueWrap}>
            <button
              className={styles.addressContinueBtn}
              type="button"
              disabled={!addressValid}
              onClick={() => setPhase('booking')}
            >
              Next &nbsp;→
            </button>
          </div>
        </>
      )}

      {/* ── PHASE 2: Booking experience overlaid on the same map ─────────── */}
      {phase === 'booking' && (
        <>
          {/* Logo — top-left */}
          <div className={styles.mapFloatingLogo}>
            <Image
              src="/velar-logo.png"
              alt="VELAR Mobile Detailing"
              width={1238}
              height={1194}
              className={styles.mapLogo}
              priority
            />
          </div>

          {/* Address confirmed pill — top-center */}
          {state.zip.trim().length > 0 && (
            <div className={styles.mapAddressBar}>
              <span className={styles.mapAddressPin}>{PinIcon}</span>
              <span className={styles.mapAddressText}>{state.zip}</span>
            </div>
          )}

          {/* Summary bar — bottom of screen (left of panel) */}
          {(pkg || price != null) && (
            <div className={styles.mapSummaryBar}>
              <div className={styles.mapSummaryInner}>
                <div className={styles.mapSummaryLeft}>
                  <div className={styles.mapSummaryPkg}>{pkg ? pkg.name : '—'}</div>
                  {vehicleLabel && <div className={styles.mapSummaryMeta}>{vehicleLabel}</div>}
                </div>
                {price != null && <div className={styles.mapSummaryPrice}>${price}</div>}
              </div>
            </div>
          )}

          {/* Booking panel — slides in from right */}
          <div className={styles.bookingPanel} ref={panelRef}>
            {submitted ? (
              <SuccessState onClose={onClose} />
            ) : (
              <>
                <div className={styles.stepIndicator}>
                  <span className={styles.stepCount}>Step {step} of {STEPS.length}</span>
                  <h2 className={styles.stepTitle}>{STEP_TITLES[step - 1]}</h2>
                  <div className={styles.progress}>
                    <div className={styles.progressFill} style={{ width: `${(step / STEPS.length) * 100}%` }} />
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
                    onClick={step === 1 ? () => setPhase('address') : goBack}
                    type="button"
                  >
                    {step === 1 ? '← Address' : '← Back'}
                  </button>
                  <div className={styles.stepNavRight}>
                    {step === 6 && submitError && (
                      <p className={styles.errorMsg} style={{ textAlign: 'right', marginBottom: 8 }}>
                        {submitError}
                      </p>
                    )}
                    {step < 6 ? (
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
                        disabled={submitting || !isStepValid(5, state)}
                      >
                        {submitting ? 'Sending…' : 'Confirm Booking'}
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

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
    case 1: return <Step2VehiclePkg state={state} update={update} />;
    case 2: return <Step3Addons state={state} update={update} />;
    case 3: return <Step4DateTime state={state} update={update} todayISO={todayISO} timeSlots={timeSlots} />;
    case 4: return <Step5 state={state} update={update} />;
    case 5: return <Step6 state={state} update={update} />;
    case 6: return <Step7 state={state} submitError={submitError} />;
    default: return null;
  }
}

/* ─── Step placeholders (replaced in Tasks 5–8) ────────────────────────── */
/* ─── Step 2: Vehicle & Package (was Step 1) ─────────────────────────────── */
function Step2VehiclePkg({ state, update }: { state: BookingState; update: (partial: Partial<BookingState> | ((prev: BookingState) => Partial<BookingState>)) => void }) {
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
/* ─── Step 3: Add-Ons (was Step 2) ──────────────────────────────────────── */
function Step3Addons({ state, update }: { state: BookingState; update: (partial: Partial<BookingState> | ((prev: BookingState) => Partial<BookingState>)) => void }) {
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

/* ─── Step 4: Date & Time (was Step 3) ──────────────────────────────────── */
function Step4DateTime({
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
// Dallas-area keywords for service area confirmation
const DALLAS_AREA = [
  'dallas','plano','frisco','mckinney','allen','richardson','garland',
  'mesquite','irving','carrollton','addison','highland park','university park',
  'lewisville','flower mound','grapevine','southlake','keller','colleyville',
  ' tx ',' tx,','texas',
];

function parsedAddress(addr: string): { street: string; rest: string | null } {
  const parts = addr.trim().split(',');
  if (parts.length >= 2) return { street: parts[0].trim(), rest: parts.slice(1).join(',').trim() };
  return { street: addr.trim(), rest: null };
}

function isDallasArea(addr: string): boolean {
  const lower = addr.toLowerCase() + ' ';
  return DALLAS_AREA.some(kw => lower.includes(kw));
}

/* ─── Step 1: Service Address (now first — SHWASH-style) ─────────────────── */
function Step1Location({ state, update }: { state: BookingState; update: (partial: Partial<BookingState> | ((prev: BookingState) => Partial<BookingState>)) => void }) {
  // Maps API and autocomplete are handled by the parent (left panel search input).
  // This component shows the confirmation card + access notes.
  // On mobile the left panel is hidden, so we show the address input here instead.
  const addressValid = state.zip.trim().length >= 10;
  const confirmed    = addressValid && isDallasArea(state.zip);
  const { street, rest } = parsedAddress(state.zip);

  return (
    <>
      <p className={styles.stepSub}>
        Enter the address where the vehicle will be serviced. We&apos;ll confirm availability by text.
      </p>

      {/* Address input — mobile only (desktop uses the left-panel floating search) */}
      <div className={styles.mobileOnlyField}>
        <label className={styles.fieldLabel} htmlFor="bk-address">
          Service Address <span className={styles.req}>*</span>
        </label>
        <input
          className={styles.fieldInput}
          id="bk-address"
          name="zip"
          type="text"
          required
          placeholder="Street address, city, state, ZIP"
          autoComplete="street-address"
          value={state.zip}
          onChange={e => update({ zip: e.target.value })}
        />
      </div>

      {/* Location confirmation card — fades in once address is valid */}
      <div
        className={[
          styles.locationCard,
          addressValid ? styles.locationCardVisible : '',
        ].filter(Boolean).join(' ')}
        aria-hidden={!addressValid}
      >
        <div className={styles.locationCardTop}>
          <span className={styles.locationIcon}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d="M9 1.5C6.1 1.5 3.75 3.85 3.75 6.75C3.75 10.875 9 16.5 9 16.5C9 16.5 14.25 10.875 14.25 6.75C14.25 3.85 11.9 1.5 9 1.5Z"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
              />
              <circle cx="9" cy="6.75" r="1.75" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
          </span>
          <div className={styles.locationAddress}>
            <span className={styles.locationStreet}>{street}</span>
            {rest && <span className={styles.locationRest}>{rest}</span>}
          </div>
        </div>
        <div className={[
          styles.locationBadge,
          confirmed ? styles.locationBadgeConfirmed : '',
        ].filter(Boolean).join(' ')}>
          {confirmed ? (
            <><span className={styles.locationBadgeCheck}>✓</span> Dallas Service Area · Confirmed</>
          ) : (
            <><span className={styles.locationBadgeCheck}>◎</span> We&apos;ll confirm service coverage by text</>
          )}
        </div>
      </div>

      {/* Access notes — optional */}
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="bk-access">
          Access Notes{' '}
          <span className={styles.fieldLabelOptional}>(optional)</span>
        </label>
        <textarea
          className={styles.fieldTextarea}
          id="bk-access"
          name="access_notes"
          placeholder="Gate code, apartment number, parking instructions, or anything we should know."
          rows={3}
          value={state.accessNotes}
          onChange={e => update({ accessNotes: e.target.value })}
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
          <span className={styles.reviewKey}>Address</span>
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
