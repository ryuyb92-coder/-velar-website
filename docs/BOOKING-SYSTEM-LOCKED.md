# VELAR Booking System — Locked Functionality Reference

> **Purpose:** This document records every piece of existing booking functionality that must be preserved before the container/layout migration. Nothing listed here may be removed, replaced, or broken during the SHWASH-style full-screen layout migration. This is the authoritative inventory.

> **Last verified:** 2026-05-29  
> **Locked commit:** `2a005b6`

---

## Overview of the Change Being Planned

**What changes:**
- The booking *container* migrates from a centered modal (max-width 940px, over the website) to a full-screen dedicated booking experience.
- Google Maps/address view becomes the persistent left panel or background.
- The existing 7 booking steps move into a right-side panel inside that full-screen experience.

**What does NOT change:**
- Every step's logic, content, and data collection (detailed below).
- The phone/name gate modal (stays exactly as-is, visually and functionally).
- The submission payload and API route.
- Pricing calculations.
- Package and add-on data.

---

## Phase 1: Phone / Name Gate (ContactGateModal)

**File:** `src/components/booking/ContactGateModal.tsx`  
**CSS:** `src/components/booking/ContactGateModal.module.css`

### Preserved exactly as-is (DO NOT TOUCH)
- VELAR logo (white version, `velar-logo-white.png`, 160–220px wide, `object-fit: contain`)
- "Reserve your detail." heading
- "Enter your number and we'll confirm your booking via text." subtitle
- **Mobile Number** field — required, `type="tel"`, `inputMode="tel"`, `autoComplete="tel"`
- **Your Name** field — optional, `type="text"`, `autoComplete="given-name"`, placeholder "First name"
- **SMS consent checkbox** — must be checked before Continue activates
- Continue button disabled until: `phone ≥ 7 digits AND smsConsent === true`
- ESC key closes the gate
- Overlay click closes the gate
- Mobile behavior: slides up from bottom (`border-radius: 20px 20px 0 0`)
- Desktop behavior: centered, `max-width: 400px`, `fadeScale` animation
- `onContinue(phone, name)` callback passes collected values to `page.tsx`

### Data passed into the booking flow
```typescript
prefillPhone: phone    // pre-populates Step 6 "Phone" field
prefillName: name      // pre-populates Step 6 "Full Name" field
```

---

## Phase 2: Full Booking Flow (BookingModal)

**File:** `src/components/booking/BookingModal.tsx` (1,199 lines)  
**CSS:** `src/components/booking/BookingModal.module.css` (1,584 lines)  
**Icons:** `src/components/booking/AddonIcons.tsx` (160 lines)

### Booking State — all 12 fields locked

```typescript
interface BookingState {
  vehicleType: 'sedan' | 'suv' | 'xl' | null;
  categoryId: string | null;           // 'interior-exterior' | 'interior-only'
  packageId: string | null;            // 'essential' | 'signature' | 'cabin-refresh' | 'deep-interior-reset'
  enhancements: string[];              // array of selected add-on names
  preferredDate: string;               // ISO date: 'YYYY-MM-DD'
  preferredTime: string;               // e.g. '8:00 AM – 10:00 AM' | 'No preference'
  zip: string;                         // full service address (sent as "Service Address" to Notion)
  accessNotes: string;                 // gate codes, parking — merged into notes on submit
  vehicleDescription: string;         // "2022 BMW X5"
  name: string;                        // pre-filled from gate
  phone: string;                       // pre-filled from gate
  email: string;
  notes: string;
}
```

### Initial state behavior
- `buildInitialState(intent)` pre-populates `categoryId` + `packageId` when opened from a pricing card CTA
- `name` and `phone` are pre-filled from the gate's `prefillName` / `prefillPhone`
- All other fields initialize to empty/null

### computePrice logic — locked

```typescript
function computePrice(state: BookingState): number | null {
  if (!state.vehicleType || !state.categoryId || !state.packageId) return null;
  const pkg = CATEGORIES.find(c => c.id === state.categoryId)
                        ?.packages.find(p => p.id === state.packageId);
  if (!pkg) return null;
  return state.vehicleType === 'sedan' ? pkg.price : pkg.xlPrice;
}
```

Sedan uses `pkg.price`. SUV and XL both use `pkg.xlPrice` (surcharge already baked into data).

### Step validation — locked per step

| Step | Condition to unlock Continue |
|---|---|
| 1 (Vehicle & Package) | `vehicleType !== null && packageId !== null` |
| 2 (Add-Ons) | Always valid — step is optional |
| 3 (Date & Time) | `preferredDate !== '' && preferredTime !== 'No preference'` |
| 4 (Location) | `zip.trim().length >= 10` |
| 5 (Vehicle Details) | `vehicleDescription.trim().length > 0` |
| 6 (Your Information) | `name.trim().length > 0 && phone.trim().length >= 7 && /\S+@\S+\.\S+/.test(email)` |
| 7 (Review & Confirm) | Always valid — Confirm Booking button guarded on Step 6 validation |

### Exit behavior — locked

- **✕ Cancel on Step 1** — closes the modal entirely
- **← Back on Steps 2–7** — navigates one step back
- **ESC** — disabled during active booking (intentional, not a bug)
- **Overlay click** — disabled during active booking (intentional, not a bug)
- **X close button** — removed (intentional)

---

## Step 1: Vehicle & Package

**Function:** `Step1`

### Must preserve
- **Category toggle**: Interior + Exterior | Interior Only (switches package list, resets `packageId` to null)
- **Vehicle size cards**: Sedan / Coupe | SUV / Truck (+$30) | XL Vehicle (+$30)
  - Each card: emoji icon, name, optional "+$30" adjustment
  - `aria-pressed` state, keyboard accessible (Enter/Space)
  - Selected state: dark background + white text
- **Package cards**: shows top 4 features from `pkg.features`, price, duration
  - Displays `from $X` when no vehicle type selected; exact `$X` when vehicle type chosen
  - `aria-pressed`, keyboard accessible
  - Featured (Signature/Deep Interior Reset): dark background + orange top accent + "Most Popular" badge
  - Selected state: orange ring (`box-shadow: 0 0 0 1px var(--color-orange)`)
- **Price calculation**: `state.vehicleType === 'sedan' ? pkg.price : pkg.xlPrice`
- **Intent pre-population**: when opened from pricing card, `categoryId` and `packageId` pre-set, Continue unlocks immediately after vehicle type selection
- **Category reset**: switching category tabs clears `packageId`

### Data sources
- `CATEGORIES` from `@/lib/pricing-data`
- `ADDON_GROUPS` not used here

---

## Step 2: Add-Ons

**Function:** `Step2`

### Must preserve
- **12 add-ons** organized into 4 groups via `ADDON_GROUPS` from `@/lib/pricing-data`:
  - Pet Hair & Odor (3 items)
  - Interior Care (4 items)
  - Exterior & Engine (4 items)
  - Condition (1 item)
- **Each row**: 44×44 icon container (24px SVG from `AddonIcons.tsx`) + name + description + price
- **Selection**: toggle — adds/removes from `state.enhancements: string[]`
  - Uses functional updater to avoid stale closure: `update(prev => ({ enhancements: ... }))`
  - `aria-pressed`, keyboard accessible
- **Selected row state**: orange left border, warm background, orange icon, orange price
- **Section stagger animation**: 55ms delay per group (CSS `animation-delay`)
- **Running subtotal**: appears only when `computePrice(state) !== null` (package + vehicle selected in Step 1)
  - Base Package: `$X` (from `computePrice`)
  - Selected Add-ons: `+$Y` (sum of `numericPrice` for items with defined numeric prices)
  - Estimated Total: `$X + Y`
  - Items with `numericPrice: undefined` (Mold Treatment, Swirl Mark Removal, Extra Dirty Fee) show but don't affect total
  - `key={basePrice + addonSum}` on total value triggers CSS pulse animation on each change
  - Note appears if non-numeric items selected

### Data sources
- `ADDON_GROUPS` from `@/lib/pricing-data`
- `ADDON_ICON_MAP` from `./AddonIcons`

---

## Step 3: Date & Time (Custom Calendar)

**Function:** `Step3`

### Must preserve
- **Booking context summary card** at top — shows package name, vehicle type, estimated price, and date+time when selected
- **Custom monthly calendar** (NO browser date picker):
  - Month navigation (← prev, → next) — prev disabled when viewing current month
  - Day-of-week headers: Mo Tu We Th Fr Sa Su (Monday = first column)
  - Past dates: `rgba(0,0,0,0.18)`, `cursor: not-allowed`, non-clickable
  - Today: orange text + small orange dot indicator
  - Selected date: solid orange background, white text
  - `calYear` and `calMonth` state initialized from `state.preferredDate` if already set
- **Date selection clears arrival window**: `update({ preferredDate: iso, preferredTime: 'No preference' })`
  - This forces the user to re-select a time slot when they change the date
- **Arrival window cards** — 3 cards, locked until date selected:
  - Morning: 8:00 AM – 10:00 AM
  - Midday: 12:00 PM – 2:00 PM
  - Afternoon: 3:00 PM – 5:00 PM
  - Locked state: `opacity: 0.45`, `pointer-events: none`
  - Section label changes: "select a date above" → "Arrival Window — Fri, May 30"
  - Selected card: orange border + warm tint + inset glow
- **Date stored as ISO string**: `YYYY-MM-DD`
- **Time stored as display string**: `'8:00 AM – 10:00 AM'`

---

## Step 4: Location

**Function:** `Step4`

### Must preserve
- **Service Address field** — full text, `autoComplete="street-address"`, stored in `state.zip`
  - Note: `state.zip` stores the full address despite the field name; sent to Notion "Service Address" column
  - Continue unlocks when `state.zip.trim().length >= 10`
- **Location confirmation card** — fades in when address is valid:
  - 240ms ease transition (opacity + translateY)
  - `parsedAddress()` splits on first comma: "400 Crescent Ct" / "Dallas, TX 75201"
  - Location pin SVG icon (orange, 18×18)
  - Dallas area detection via `isDallasArea()` — checks for 20 city/state keywords
  - **Confirmed badge**: dark green (#1a7a3c) "✓ Dallas Service Area · Confirmed"
  - **Fallback badge**: muted "◎ We'll confirm service coverage by text"
- **Access Notes** — optional textarea, stored in `state.accessNotes`
  - `placeholder`: "Gate code, apartment number, parking instructions…"
  - Merged into submission notes with prefix "Access Notes:"

---

## Step 5: Vehicle Details

**Function:** `Step5`

### Must preserve
- Single text field: "Year, Make, Model"
- `placeholder`: "e.g. 2022 BMW X5"
- `autoComplete` intentionally omitted (removed in a previous fix — user typed freer address then)
- Stored in `state.vehicleDescription`
- Continue unlocks when `state.vehicleDescription.trim().length > 0`

---

## Step 6: Your Information

**Function:** `Step6`

### Must preserve
- **Two-column row** (stacks on mobile < 480px):
  - Full Name: `id="bk-name"`, `autoComplete="name"`, pre-filled from gate
  - Phone: `id="bk-phone"`, `type="tel"`, `autoComplete="tel"`, `inputMode="tel"`, pre-filled from gate
- **Email Address**: `id="bk-email"`, `type="email"`, `autoComplete="email"`, `inputMode="email"`
- **Notes** (optional): `id="bk-notes"`, textarea, `rows={3}`, "(optional)" label uses `.fieldLabelOptional` class

---

## Step 7: Review & Confirm

**Function:** `Step7`

### Must preserve
- **Service section**: Package (`cat.label — pkg.name`), Vehicle size, Add-ons (conditional)
- **Schedule section**: Date, Time, ZIP (address)
- **Contact section**: Name, Phone, Email, Vehicle description
- **Estimated Total**: orange, large, from `computePrice(state)`
- **Submit error** shown just above the Confirm Booking button (in `.stepNavRight`)
- Confirm Booking button guarded: `disabled={submitting || !isStepValid(6, state)}`
  - This catches the case where Step 6 validation was bypassed

---

## Success State

**Function:** `SuccessState`

### Must preserve
- "Request Received" eyebrow
- "We'll be in touch shortly." heading
- "We typically confirm within 1–2 hours during business hours."
- Call button: `href="tel:+1${VELAR_PHONE}"` — uses env var
- Text button: `href="sms:+1${VELAR_PHONE}"`
- Done button — closes the booking experience

---

## Submission Payload — Exact field names required

```typescript
const payload = {
  name:           state.name,
  phone:          state.phone,
  email:          state.email,
  vehicle:        `${state.vehicleDescription} (${vehicleTypeLabel})`,
  service:        `${cat.label} — ${pkg.name}`,
  preferred_date: state.preferredDate,
  preferred_time: state.preferredTime,
  zip:            state.zip,              // full address string
  notes:          [
    state.accessNotes ? `Access Notes: ${state.accessNotes}` : '',
    state.notes,
    state.enhancements.length > 0 ? `Add-ons requested: ${list}` : '',
  ].filter(Boolean).join('\n\n'),
};
```

**API route:** `POST /api/book` → Notion database  
**Required fields in API:** `name`, `phone`, `service`  
**Notion column "Service Address"** receives `zip` (full address)

---

## Sidebar Booking Summary

### Must preserve
- VELAR logo (`/velar-logo.png`, orange version, `height: 34px`)
- "BOOKING SUMMARY" orange uppercase label
- **Service** row: `pkg.name` or `—`
- **Vehicle** row: "Sedan / Coupe" | "SUV / Truck (+$30)" | "XL Vehicle (+$30)" | `—`
- **Est. Total**: `$${price}` in orange + `pkg.duration + " · subject to review"` OR "TBD"
- Summary updates live as user progresses through steps

---

## Intent Pre-Population

When a pricing card "Book Now" CTA is clicked, the modal opens with:
```typescript
{ packageName: pkg.name, categoryLabel: category.label, price: displayPrice }
```

`buildInitialState` resolves this to `categoryId` + `packageId` so Step 1 opens with the package pre-selected. The user must still select vehicle size to enable Continue.

---

## Step Progress Indicator

### Must preserve
- "Step X of 7" — orange, uppercase, `letter-spacing: 0.24em`
- Step title (from `STEP_TITLES` array)
- Orange progress bar: `width: (step / 7) * 100%`, animated with `transition: width 0.4s`

---

## Current Step Order (as of locked commit)

```
Step 1: Vehicle & Package      isStepValid: vehicleType && packageId
Step 2: Add-Ons                isStepValid: always true
Step 3: Date & Time            isStepValid: date !== '' && time !== 'No preference'
Step 4: Location               isStepValid: zip.trim().length >= 10
Step 5: Vehicle Details        isStepValid: vehicleDescription.trim().length > 0
Step 6: Your Information       isStepValid: name + phone + email valid
Step 7: Review & Confirm       isStepValid: always true
```

---

## Packages and Pricing Data (from pricing-data.ts)

### Interior + Exterior
| Package | Sedan | SUV/XL |
|---|---|---|
| Essential | $159 | $189 |
| Signature | $239 | $279 |

### Interior Only
| Package | Sedan | SUV/XL |
|---|---|---|
| Cabin Refresh | $179 | $209 |
| Deep Interior Reset | $279 | $309 |

### Add-ons with numeric prices
| Add-On | Price |
|---|---|
| Light Pet Hair Removal | $35 |
| Heavy Pet Hair Removal | $69 |
| Ozone Odor Treatment | $55 |
| Individual Seat Cleaning | $40 |
| Headliner Deep Cleaning | $55 |
| Bio Cleaning Fee | $55 |
| Engine Bay Detail | $65 |
| Clay Bar Treatment | $55 |
| Headlight Restoration (pair) | $110 |

### Add-ons with non-numeric prices (selectable but excluded from subtotal)
| Add-On | Display |
|---|---|
| Mold Treatment | Contact Us |
| Swirl Mark Removal | Contact Us |
| Extra Dirty Fee | $50+/hr |

---

## Implementation Plan: Container Migration

### What changes

**Goal:** Keep every step function exactly as-is. Change only the container that wraps them.

### New layout architecture

```
Full-screen overlay (position: fixed; inset: 0; z-index: 100)
├── Left panel: Google Maps (persistent across all steps)
│   └── Width: ~55% desktop | hidden on mobile
└── Right panel: existing booking flow
    ├── Step indicator (Step X of 7 + title + progress bar)
    ├── Step content (Step1–Step7 functions, UNCHANGED)
    └── Step nav (Back / Continue)
```

The dark sidebar with logo + booking summary either:
- Becomes part of the right panel header
- OR moves into the map panel as an overlay element

### Step reorder for new flow

The Location step (currently Step 4) moves to Step 1 (after the gate, the first thing the user sees is the address/map). All other steps shift:

```
New Step 1: Location / Service Address  (was Step 4)
New Step 2: Vehicle & Package           (was Step 1)
New Step 3: Add-Ons                     (was Step 2)
New Step 4: Date & Time                 (was Step 3)
New Step 5: Vehicle Details             (was Step 5) — unchanged
New Step 6: Your Information            (was Step 6) — unchanged
New Step 7: Review & Confirm            (was Step 7) — unchanged
```

`isStepValid` case numbers update to match. Step function code is untouched.

### Transition from gate to full-screen

1. User clicks Continue in gate
2. Dark curtain rises (opacity 0→1, 360ms, z-index 200)
3. Under the curtain: gate unmounts, full-screen booking mounts
4. Curtain falls (opacity 1→0, 320ms) while booking fades in (`fsEnter` animation)
5. User sees: gate → black → full-screen booking experience

### Files that change

| File | Type of change |
|---|---|
| `src/app/page.tsx` | Add curtain state + transition timing logic |
| `src/app/globals.css` | Add curtain animation keyframes + classes |
| `src/components/booking/BookingModal.tsx` | Reorder STEPS/STEP_TITLES/StepContent/isStepValid; restructure container layout; add Google Maps to new Step 1; rename step functions |
| `src/components/booking/BookingModal.module.css` | Overlay → full-screen; Frame → full-screen split panel; entrance animation; map panel styles |
| `.env.local` | Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=` |
| `src/lib/config.ts` | Export `MAPS_API_KEY` |

### Files that do NOT change

| File | Reason |
|---|---|
| `ContactGateModal.tsx` | Zero edits — gate stays exactly as-is |
| `ContactGateModal.module.css` | Zero edits |
| `AddonIcons.tsx` | Zero edits — icons used in Add-Ons step unchanged |
| `pricing-data.ts` | Zero edits — all package/addon data preserved |
| `/api/book/route.ts` | Zero edits — payload shape unchanged |
| All pricing section components | Zero edits |
| `HeroSection`, `Nav`, footer, FAQ, etc. | Zero edits |

### Google Maps integration

**APIs used:**
- Google Maps JavaScript API + Places library — loads with single script tag
- Maps Embed API (iframe) — always free, shows map after address confirmed

**Graceful fallback (no API key):**
- Plain text input renders
- Existing location confirmation card shows
- Dallas service area detection still works
- Booking flow continues normally
- No maps visible but no functionality lost

**API key:**
- Stored in `.env.local` as `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- Exported from `src/lib/config.ts`
- Never hardcoded

---

## Acceptance Criteria Before Shipping

Before this migration is considered complete, all of the following must pass:

- [ ] ContactGateModal appears and behaves exactly as before (centered, small, blur backdrop)
- [ ] Gate → full-screen transition is smooth (curtain rise, no hard cut)
- [ ] Full-screen booking covers 100% of viewport (website not visible)
- [ ] All 7 steps render correctly inside the new layout
- [ ] Step 1 (Location) shows address input + map iframe (or fallback) + location card
- [ ] Steps 2–7 are visually and functionally identical to current implementation
- [ ] `computePrice` returns correct values for all package/vehicle combinations
- [ ] Add-on subtotal calculates correctly
- [ ] Custom calendar navigates months, selects dates, clears time on date change
- [ ] Arrival window cards lock until date selected
- [ ] Step validation gates Continue correctly for all 7 steps
- [ ] Back on Step 1 closes the full-screen experience (returns to website)
- [ ] ESC key is disabled during active booking flow
- [ ] Overlay click is disabled during active booking flow
- [ ] Intent pre-population from pricing cards still works
- [ ] Submission payload shape is unchanged (verified against `/api/book` expectations)
- [ ] Success state shows and closes correctly
- [ ] `npx tsc --noEmit` passes with 0 errors
- [ ] `npm run build` completes successfully
- [ ] Mobile responsive (< 640px): map hidden, step panel full-width
