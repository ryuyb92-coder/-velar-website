# Hero, Nav & Booking Modal Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved production visual direction into the real Next.js site — redesigned Nav (dark overlay, image logo, orange CTA), HeroSection (full-viewport dark cinematic with SVG car), and BookingModal (7-step split-panel concierge flow).

**Architecture:** Nav becomes `position: fixed` with a scroll-triggered transparency class; HeroSection is a full-viewport dark section with layered CSS atmosphere and an inline SVG sports car; BookingModal is replaced with a 7-step split-panel (dark sidebar + white step panel) using local React state, `createPortal`, and the same API payload shape as before.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, DM Sans (Google Fonts), existing `/api/book` Notion route (unchanged).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/app/globals.css` | Modify | Add `--color-orange` token; update `scroll-padding-top` to 74px |
| `src/app/layout.tsx` | Modify | Add DM Sans weights 700, 800 |
| `public/velar-logo.png` | Replace | Orange version from `references/velar-logo.png` |
| `src/components/layout/Nav.tsx` | Rewrite | Fixed overlay nav with scroll class, image logo, orange CTA |
| `src/components/layout/Nav.module.css` | Rewrite | Transparent-to-dark transition, image logo sizing |
| `src/components/sections/HeroSection.tsx` | Rewrite | Full-viewport dark, SVG car, atmospheric layers |
| `src/components/sections/HeroSection.module.css` | Rewrite | Viewport layout, car stage, atmospheric CSS, content positioning |
| `src/components/booking/BookingModal.tsx` | Rewrite | 7-step split-panel flow, all step components inline |
| `src/components/booking/BookingModal.module.css` | Rewrite | Split panel layout, sidebar, step panel, mobile collapse |

**Do not touch:** `page.tsx`, `pricing-data.ts`, `config.ts`, `/api/book/route.ts`, any pricing/FAQ/footer/process/whyvelar components, `StickyMobileCTA`.

---

## Task 1: Foundation — Design Token, Font Weights, Orange Logo

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Replace: `public/velar-logo.png`

- [ ] **Step 1.1: Add `--color-orange` CSS variable to globals.css**

  In `src/app/globals.css`, inside `:root { }`, add after the `--color-blue-muted` line:

  ```css
  --color-orange: #f26a0d;
  ```

  Also update `scroll-padding-top` in `html { }` from `64px` to `74px`:
  ```css
  scroll-padding-top: 74px;
  ```

- [ ] **Step 1.2: Add font weights 700 and 800 to layout.tsx**

  In `src/app/layout.tsx`, change:
  ```ts
  const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600'],
    variable: '--font-dm-sans',
    display: 'swap',
  });
  ```
  To:
  ```ts
  const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800'],
    variable: '--font-dm-sans',
    display: 'swap',
  });
  ```

- [ ] **Step 1.3: Replace public/velar-logo.png with orange version**

  ```bash
  cp references/velar-logo.png public/velar-logo.png
  ```

  Verify: `file public/velar-logo.png` should output `PNG image data, 1238 x 1194`.

- [ ] **Step 1.4: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 1.5: Commit**

  ```bash
  git add src/app/globals.css src/app/layout.tsx public/velar-logo.png
  git commit -m "feat: add orange design token, load DM Sans 700/800, update logo to orange version"
  ```

---

## Task 2: Nav Redesign

**Files:**
- Rewrite: `src/components/layout/Nav.tsx`
- Rewrite: `src/components/layout/Nav.module.css`

The Nav must:
- Be `position: fixed; top: 0` so it overlays the hero
- Be transparent (dark-tinted, near-invisible) when the hero is visible
- Become opaque dark (`#08070605` → `rgba(8,7,6,0.96)`) when scrolled past the hero
- Show the orange logo image (from `public/velar-logo.png`) via Next.js `<Image>`
- Have centered nav links: Home, Services, Packages, FAQ
- Have an orange "Book Now" button on the right
- Height: 74px
- On mobile (< 640px): hide all nav links, keep logo + Book Now only

The scroll detection uses `IntersectionObserver` on a sentinel element. The hero section (next task) will have `data-hero-sentinel` on its root element; the Nav watches for when that exits the viewport.

- [ ] **Step 2.1: Rewrite Nav.tsx**

  Replace `src/components/layout/Nav.tsx` entirely:

  ```tsx
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
  ```

- [ ] **Step 2.2: Rewrite Nav.module.css**

  Replace `src/components/layout/Nav.module.css` entirely:

  ```css
  /* ─── Header shell ────────────────────────────────────────────────────────── */
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 80;
    height: 74px;
    transition: background 0.3s ease, border-color 0.3s ease,
                backdrop-filter 0.3s ease;
    border-bottom: 1px solid transparent;
  }

  /* Transparent state — over hero */
  .header:not(.scrolled) {
    background: transparent;
  }

  /* Opaque state — past hero */
  .header.scrolled {
    background: rgba(8, 7, 6, 0.96);
    border-bottom-color: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  /* ─── Inner layout ────────────────────────────────────────────────────────── */
  .inner {
    max-width: var(--container-max);
    margin-inline: auto;
    padding-inline: var(--container-padding);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  /* ─── Logo ────────────────────────────────────────────────────────────────── */
  .logo {
    display: flex;
    align-items: center;
    text-decoration: none;
    flex-shrink: 0;
  }

  .logoImg {
    height: 36px;
    width: auto;
    object-fit: contain;
    display: block;
  }

  /* ─── Nav links — centered ────────────────────────────────────────────────── */
  .links {
    display: flex;
    align-items: center;
    gap: 36px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  .link {
    font-size: 0.77rem;
    font-weight: 400;
    letter-spacing: 0.04em;
    color: rgba(255, 255, 255, 0.46);
    text-decoration: none;
    transition: color 0.2s;
    white-space: nowrap;
  }

  .link:hover {
    color: rgba(255, 255, 255, 0.82);
  }

  /* ─── Book Now CTA ────────────────────────────────────────────────────────── */
  .bookBtn {
    font-family: var(--font-sans);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #fff;
    background: var(--color-orange);
    border: none;
    border-radius: 5px;
    padding: 10px 22px;
    cursor: pointer;
    white-space: nowrap;
    flex-shrink: 0;
    transition: opacity 0.2s;
  }

  .bookBtn:hover {
    opacity: 0.88;
  }

  /* ─── Mobile — hide links ─────────────────────────────────────────────────── */
  @media (max-width: 639px) {
    .links {
      display: none;
    }
  }
  ```

- [ ] **Step 2.3: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors. If `next/image` raises an error, verify `@types/react` is installed and `next.config.ts` has `images.formats` set.

- [ ] **Step 2.4: Commit**

  ```bash
  git add src/components/layout/Nav.tsx src/components/layout/Nav.module.css
  git commit -m "feat: nav — fixed overlay with scroll transparency, image logo, orange CTA"
  ```

---

## Task 3: HeroSection Redesign

**Files:**
- Rewrite: `src/components/sections/HeroSection.tsx`
- Rewrite: `src/components/sections/HeroSection.module.css`

The hero must:
- Be `min-height: 100vh` — full viewport
- Have the dark atmospheric background (warm near-black, not pure black)
- Show the SVG sports coupe on the right half, with body highlights and tail glow
- Show left-side content: orange eyebrow, bold H1 with "you." in orange, subtitle, CTAs
- Have a trust bar at the bottom
- Have `data-hero-sentinel` on the root `<section>` so Nav's IntersectionObserver works
- Add `padding-top: 74px` to hero content (nav height) so content starts below the fixed nav

- [ ] **Step 3.1: Rewrite HeroSection.tsx**

  Replace `src/components/sections/HeroSection.tsx` entirely:

  ```tsx
  'use client';

  import type { BookingIntent } from '@/components/booking/BookingModal';
  import styles from './HeroSection.module.css';

  interface Props {
    onBook: (intent: BookingIntent) => void;
  }

  export default function HeroSection({ onBook }: Props) {
    return (
      <section className={styles.section} data-hero-sentinel aria-label="Hero">

        {/* Atmospheric depth layers */}
        <div className={styles.atmos} aria-hidden="true" />
        <div className={styles.floor} aria-hidden="true" />
        <div className={styles.fadeLeft} aria-hidden="true" />

        {/* Car stage — right half */}
        <div className={styles.carStage} aria-hidden="true">
          <div className={styles.carKeyLight} />
          <div className={styles.carRimGlow} />
          <div className={styles.carShadow} />
          <div className={styles.carWrap}>
            <CarSVG />
          </div>
          <div className={styles.carFloorLine} />
        </div>

        {/* Left: text content */}
        <div className={styles.content}>
          <span className={styles.eyebrow}>Premium Mobile Detailing</span>
          <h1 className={styles.heading}>
            Premium care.<br />
            Delivered to <span className={styles.orange}>you.</span>
          </h1>
          <p className={styles.sub}>
            Concierge-level detailing at your door.<br />
            Professional grade. No shop visits.
          </p>
          <div className={styles.ctas}>
            <button
              type="button"
              className={styles.primaryCta}
              onClick={() => onBook({})}
            >
              Book Now &nbsp;→
            </button>
            <a href="#pricing" className={styles.secondaryCta}>
              View Packages
            </a>
          </div>
        </div>

        {/* Trust bar */}
        <div className={styles.trustBar} aria-label="Trust indicators">
          <div className={styles.trustItem}>
            <span className={styles.trustIcon} aria-hidden="true">◈</span>
            <div>
              <div className={styles.trustLabel}>We Come to You</div>
              <div className={styles.trustSub}>Home, office, or anywhere</div>
            </div>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon} aria-hidden="true">◆</span>
            <div>
              <div className={styles.trustLabel}>Premium Products</div>
              <div className={styles.trustSub}>Professional-grade only</div>
            </div>
          </div>
          <div className={styles.trustItem}>
            <span className={styles.trustIcon} aria-hidden="true">✦</span>
            <div>
              <div className={styles.trustLabel}>100% Satisfaction</div>
              <div className={styles.trustSub}>Guaranteed every time</div>
            </div>
          </div>
        </div>

      </section>
    );
  }

  /* ─── SVG Sports Coupe ──────────────────────────────────────────────────────
     Approved mockup car — dark metallic body, roof/shoulder highlights,
     orange tail light glow, 5-spoke alloy wheels.
  ────────────────────────────────────────────────────────────────────────── */
  function CarSVG() {
    return (
      <svg
        viewBox="0 0 860 360"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.carSvg}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="vBodyMain" x1="0.1" y1="0" x2="0.1" y2="1">
            <stop offset="0%"   stopColor="#2e2a24"/>
            <stop offset="20%"  stopColor="#201e1a"/>
            <stop offset="55%"  stopColor="#161410"/>
            <stop offset="100%" stopColor="#0c0a08"/>
          </linearGradient>
          <linearGradient id="vBodySide" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1a1816"/>
            <stop offset="60%"  stopColor="#111010"/>
            <stop offset="100%" stopColor="#0a0908"/>
          </linearGradient>
          <linearGradient id="vHoodGrad" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%"   stopColor="#222018"/>
            <stop offset="50%"  stopColor="#141210"/>
            <stop offset="100%" stopColor="#0c0a08"/>
          </linearGradient>
          <linearGradient id="vWindshield" x1="0.2" y1="0" x2="0.7" y2="1">
            <stop offset="0%"   stopColor="#182018" stopOpacity="0.65"/>
            <stop offset="70%"  stopColor="#0d1410" stopOpacity="0.88"/>
            <stop offset="100%" stopColor="#080f0b" stopOpacity="0.95"/>
          </linearGradient>
          <linearGradient id="vRearGlass" x1="0.2" y1="0" x2="0.5" y2="1">
            <stop offset="0%"   stopColor="#14201a" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="#080f0c" stopOpacity="0.9"/>
          </linearGradient>
          <radialGradient id="vRimGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%"   stopColor="#2e2a24"/>
            <stop offset="45%"  stopColor="#181614"/>
            <stop offset="78%"  stopColor="#0f0d0b"/>
            <stop offset="100%" stopColor="#080706"/>
          </radialGradient>
          <radialGradient id="vTireGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%"   stopColor="#0e0c0a"/>
            <stop offset="100%" stopColor="#060504"/>
          </radialGradient>
          <linearGradient id="vKeyLight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="white" stopOpacity="0"/>
            <stop offset="22%"  stopColor="white" stopOpacity="0.14"/>
            <stop offset="40%"  stopColor="white" stopOpacity="0.26"/>
            <stop offset="57%"  stopColor="white" stopOpacity="0.22"/>
            <stop offset="75%"  stopColor="white" stopOpacity="0.10"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="vShoulderLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="white" stopOpacity="0"/>
            <stop offset="12%"  stopColor="white" stopOpacity="0.06"/>
            <stop offset="34%"  stopColor="white" stopOpacity="0.18"/>
            <stop offset="55%"  stopColor="white" stopOpacity="0.22"/>
            <stop offset="74%"  stopColor="white" stopOpacity="0.14"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="vMidLine" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="white" stopOpacity="0"/>
            <stop offset="38%"  stopColor="white" stopOpacity="0.12"/>
            <stop offset="56%"  stopColor="white" stopOpacity="0.14"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </linearGradient>
          <radialGradient id="vTailGlow" cx="100%" cy="50%" r="75%">
            <stop offset="0%"   stopColor="#f26a0d" stopOpacity="0.22"/>
            <stop offset="30%"  stopColor="#f26a0d" stopOpacity="0.09"/>
            <stop offset="100%" stopColor="#f26a0d" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="vGroundShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#000000" stopOpacity="0.88"/>
            <stop offset="100%" stopColor="#000000" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="vWellShadow" cx="50%" cy="100%" r="60%">
            <stop offset="0%"   stopColor="#000" stopOpacity="0.7"/>
            <stop offset="100%" stopColor="#000" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Ground shadow */}
        <ellipse cx="435" cy="346" rx="410" ry="18" fill="url(#vGroundShadow)"/>

        {/* Floor reflection */}
        <g transform="translate(0,346) scale(1,-0.14)" opacity="0.28">
          <path d="M 60 190 Q 110 205 165 212 L 190 228 Q 230 240 310 242 L 580 238 Q 640 234 688 222 L 742 208 Q 778 196 808 180 L 820 170 L 820 270 L 60 270 Z"
            fill="url(#vBodyMain)" opacity="0.35"/>
        </g>

        {/* Lower sill */}
        <path d="M 60 272 Q 90 276 145 278 L 200 280 Q 225 283 250 285 L 595 285 Q 628 283 662 280 L 708 278 Q 748 276 802 270 L 814 262 L 820 270 L 60 270 Z" fill="#08070605"/>

        {/* Main coupe body */}
        <path d="M 60 270 L 65 262 L 80 244 Q 98 228 122 218 L 158 208 Q 176 204 195 202 L 212 200 Q 228 190 248 176 L 272 158 Q 282 142 298 134 L 330 124 L 396 114 L 500 112 L 554 116 L 588 124 Q 610 132 630 145 L 654 162 Q 668 172 683 182 L 718 194 Q 742 202 768 210 L 790 220 Q 806 228 814 242 L 820 258 L 820 270 Z" fill="url(#vBodyMain)"/>

        {/* Hood */}
        <path d="M 65 265 L 80 246 Q 96 230 118 220 L 155 210 L 192 202 L 208 200 L 210 205 L 196 208 L 162 216 Q 128 226 112 236 L 96 250 L 82 266 Z" fill="url(#vHoodGrad)"/>

        {/* Upper body shoulder */}
        <path d="M 200 200 Q 240 192 280 178 Q 308 168 326 158 Q 350 146 384 132 Q 424 120 500 116 Q 556 116 590 124 Q 614 132 636 148 Q 655 162 669 174 Q 692 190 720 196 L 718 194 Q 742 202 768 210 L 790 220 Q 806 228 814 242 L 820 258 L 820 270 Q 794 262 768 255 L 724 248 Q 695 242 668 236 L 636 228 Q 614 222 590 216 L 554 212 Q 520 210 500 210 L 440 210 Q 400 212 360 218 Q 320 226 286 234 Q 258 240 228 246 L 200 252 Z" fill="url(#vBodySide)"/>

        {/* Roof key-light highlight */}
        <path d="M 300 120 Q 400 110 500 112 Q 554 114 586 122 L 598 128" fill="none" stroke="url(#vKeyLight)" strokeWidth="2.5" strokeLinecap="round"/>

        {/* Shoulder highlight */}
        <path d="M 205 198 Q 248 190 286 178 Q 316 168 338 158 Q 362 148 396 136 Q 436 126 500 122 Q 558 122 594 130 Q 620 138 644 154 Q 664 168 678 180 Q 700 192 726 198" fill="none" stroke="url(#vShoulderLine)" strokeWidth="2" strokeLinecap="round"/>

        {/* Mid-body character crease */}
        <path d="M 90 238 Q 148 230 208 224 Q 268 220 320 214 Q 380 208 440 205 Q 498 204 558 206 Q 610 210 654 216 Q 704 224 756 234 L 800 244" fill="none" stroke="url(#vMidLine)" strokeWidth="1.5" strokeLinecap="round"/>

        {/* Windshield */}
        <path d="M 298 136 L 330 124 L 404 114 L 500 112 L 516 114 L 512 118 L 448 120 L 374 122 L 340 130 L 320 142 L 308 152 Z" fill="url(#vWindshield)"/>
        <path d="M 298 136 L 320 142 L 342 130 L 376 122 L 448 120 L 512 118" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1.2"/>

        {/* A-pillar */}
        <path d="M 298 136 L 310 116 L 330 113 L 330 124" fill="#0d0c0a"/>

        {/* Rear glass / C-pillar */}
        <path d="M 516 114 L 556 118 L 588 126 L 608 140 L 610 152 L 600 160 L 575 148 L 546 134 L 520 124 Z" fill="url(#vRearGlass)"/>

        {/* Rear tail */}
        <path d="M 775 214 L 790 220 Q 806 228 814 242 L 820 258 L 820 270 L 810 270 L 808 258 Q 806 246 800 236 L 790 226 L 780 220 Z" fill="#0c0b09"/>

        {/* Tail light strip */}
        <path d="M 806 232 L 820 240 L 820 256 L 808 262" fill="none" stroke="rgba(242,106,13,0.28)" strokeWidth="1.8"/>
        <path d="M 808 234 L 820 242 L 820 254 L 810 260" fill="rgba(242,106,13,0.08)"/>

        {/* Orange tail ambient */}
        <ellipse cx="826" cy="248" rx="70" ry="60" fill="url(#vTailGlow)"/>

        {/* Front grille line */}
        <path d="M 63 265 L 78 267" fill="none" stroke="rgba(242,106,13,0.12)" strokeWidth="1.5"/>

        {/* Door seam */}
        <line x1="436" y1="202" x2="436" y2="274" stroke="rgba(0,0,0,0.45)" strokeWidth="1.5"/>
        <line x1="436" y1="202" x2="436" y2="274" stroke="rgba(255,255,255,0.022)" strokeWidth="0.5"/>

        {/* Mirror */}
        <path d="M 252 175 L 270 170 L 272 183 L 256 188 Z" fill="#0e0d0b" stroke="rgba(255,255,255,0.045)" strokeWidth="0.5"/>

        {/* ── FRONT WHEEL ── */}
        <path d="M 155 268 Q 155 234 186 224 Q 213 216 240 224 Q 267 234 267 268 Z" fill="url(#vWellShadow)" opacity="0.65"/>
        <ellipse cx="211" cy="272" rx="57" ry="57" fill="#060504"/>
        <ellipse cx="211" cy="272" rx="53" ry="53" fill="url(#vTireGrad)"/>
        <ellipse cx="211" cy="272" rx="40" ry="40" fill="url(#vRimGrad)"/>
        <g stroke="rgba(255,255,255,0.14)" strokeWidth="1.6" strokeLinecap="round">
          <line x1="211" y1="237" x2="211" y2="307"/>
          <line x1="177" y1="272" x2="245" y2="272"/>
          <line x1="187" y1="248" x2="235" y2="296"/>
          <line x1="235" y1="248" x2="187" y2="296"/>
        </g>
        <ellipse cx="211" cy="272" rx="26" ry="26" fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth="1.5"/>
        <ellipse cx="211" cy="272" rx="10" ry="10" fill="#141210"/>
        <ellipse cx="211" cy="272" rx="6" ry="6" fill="#1e1c18"/>
        <path d="M 168 238 Q 160 272 172 306" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2"/>

        {/* ── REAR WHEEL ── */}
        <path d="M 610 268 Q 610 232 644 222 Q 672 214 700 222 Q 728 232 728 268 Z" fill="url(#vWellShadow)" opacity="0.65"/>
        <ellipse cx="669" cy="272" rx="57" ry="57" fill="#060504"/>
        <ellipse cx="669" cy="272" rx="53" ry="53" fill="url(#vTireGrad)"/>
        <ellipse cx="669" cy="272" rx="40" ry="40" fill="url(#vRimGrad)"/>
        <g stroke="rgba(255,255,255,0.14)" strokeWidth="1.6" strokeLinecap="round">
          <line x1="669" y1="237" x2="669" y2="307"/>
          <line x1="635" y1="272" x2="703" y2="272"/>
          <line x1="645" y1="248" x2="693" y2="296"/>
          <line x1="693" y1="248" x2="645" y2="296"/>
        </g>
        <ellipse cx="669" cy="272" rx="26" ry="26" fill="none" stroke="rgba(255,255,255,0.055)" strokeWidth="1.5"/>
        <ellipse cx="669" cy="272" rx="10" ry="10" fill="#141210"/>
        <ellipse cx="669" cy="272" rx="6" ry="6" fill="#1e1c18"/>
        <path d="M 626 238 Q 618 272 630 306" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2"/>
      </svg>
    );
  }
  ```

- [ ] **Step 3.2: Rewrite HeroSection.module.css**

  Replace `src/components/sections/HeroSection.module.css` entirely:

  ```css
  /* ─── Section shell ───────────────────────────────────────────────────────── */
  .section {
    position: relative;
    min-height: 100vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background: #08070605;
  }

  /* ─── Atmospheric layers ──────────────────────────────────────────────────── */
  .atmos {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 35% at 72% 100%, rgba(18,14,10,0.9) 0%, transparent 60%),
      radial-gradient(ellipse 40% 50% at 20% 20%, rgba(22,20,16,0.5) 0%, transparent 65%),
      linear-gradient(125deg, #0b0a08 0%, #090806 35%, #0a0907 55%, #080605 75%, #060504 100%);
  }

  .floor {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 28%;
    background:
      radial-gradient(ellipse 80% 100% at 65% 100%, rgba(14,12,10,0.6) 0%, transparent 55%),
      radial-gradient(ellipse 40% 80% at 85% 100%, rgba(242,106,13,0.025) 0%, transparent 50%);
  }

  /* Left fade — protects text readability */
  .fadeLeft {
    position: absolute;
    inset: 0;
    background: linear-gradient(100deg,
      rgba(8,7,6,0.97) 0%,
      rgba(8,7,6,0.92) 28%,
      rgba(8,7,6,0.68) 44%,
      rgba(8,7,6,0.28) 58%,
      rgba(8,7,6,0.06) 70%,
      transparent 80%
    );
  }

  /* ─── Car stage ───────────────────────────────────────────────────────────── */
  .carStage {
    position: absolute;
    right: -4%;
    top: 5%;
    bottom: 3%;
    width: 66%;
  }

  .carKeyLight {
    position: absolute;
    top: 0; left: 8%; right: 5%;
    height: 90px;
    background: radial-gradient(ellipse 70% 100% at 52% 0%,
      rgba(255,255,255,0.025) 0%, transparent 100%
    );
  }

  .carRimGlow {
    position: absolute;
    right: 0; top: 8%; bottom: 15%;
    width: 120px;
    background: linear-gradient(270deg,
      rgba(242,106,13,0.055) 0%,
      rgba(242,106,13,0.02) 40%,
      transparent 100%
    );
    filter: blur(18px);
  }

  .carShadow {
    position: absolute;
    bottom: 14%; left: 10%; right: 4%;
    height: 6px;
    background: radial-gradient(ellipse 70% 100% at 50% 50%, rgba(0,0,0,0.9) 0%, transparent 100%);
    filter: blur(4px);
  }

  .carWrap {
    position: absolute;
    bottom: 15%;
    left: 0; right: 0;
    height: 65%;
  }

  .carSvg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .carFloorLine {
    position: absolute;
    bottom: 15%; left: 8%; right: 2%;
    height: 1px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(255,255,255,0.015) 15%,
      rgba(255,255,255,0.05) 38%,
      rgba(255,255,255,0.07) 55%,
      rgba(255,255,255,0.04) 72%,
      rgba(242,106,13,0.06) 88%,
      transparent 100%
    );
  }

  /* ─── Left content block ──────────────────────────────────────────────────── */
  .content {
    position: relative;
    z-index: 20;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 110px clamp(20px, 5vw, 56px) clamp(40px, 5vw, 72px);
    max-width: 560px;
  }

  .eyebrow {
    display: block;
    font-size: 0.61rem;
    font-weight: 600;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    color: var(--color-orange);
    margin-bottom: 22px;
  }

  .heading {
    font-size: clamp(2.8rem, 5.4vw, 4.8rem);
    font-weight: 800;
    line-height: 0.96;
    letter-spacing: -0.035em;
    color: #fff;
    margin-bottom: 24px;
  }

  .orange {
    color: var(--color-orange);
  }

  .sub {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.44);
    line-height: 1.72;
    max-width: 340px;
    margin-bottom: 44px;
  }

  .ctas {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .primaryCta {
    font-family: var(--font-sans);
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #fff;
    background: var(--color-orange);
    border: none;
    border-radius: 5px;
    padding: 14px 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    box-shadow: 0 6px 28px rgba(242,106,13,0.28);
    transition: opacity 0.2s;
    white-space: nowrap;
  }

  .primaryCta:hover {
    opacity: 0.88;
  }

  .secondaryCta {
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.42);
    text-decoration: none;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 5px;
    padding: 13px 24px;
    transition: color 0.2s, border-color 0.2s;
    white-space: nowrap;
  }

  .secondaryCta:hover {
    color: rgba(255, 255, 255, 0.7);
    border-color: rgba(255, 255, 255, 0.25);
  }

  /* ─── Trust bar ───────────────────────────────────────────────────────────── */
  .trustBar {
    position: relative;
    z-index: 20;
    border-top: 1px solid rgba(255, 255, 255, 0.055);
    display: flex;
  }

  .trustItem {
    flex: 1;
    padding: 22px clamp(20px, 5vw, 56px);
    border-right: 1px solid rgba(255, 255, 255, 0.04);
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .trustItem:last-child {
    border-right: none;
  }

  .trustIcon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.07);
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.35);
    font-size: 0.65rem;
    flex-shrink: 0;
  }

  .trustLabel {
    font-size: 0.63rem;
    font-weight: 600;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.45);
    margin-bottom: 3px;
  }

  .trustSub {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.18);
  }

  /* ─── Mobile adjustments ──────────────────────────────────────────────────── */
  @media (max-width: 767px) {
    /* Car is hidden on mobile — not enough width */
    .carStage {
      display: none;
    }

    .fadeLeft {
      background: linear-gradient(180deg,
        rgba(8,7,6,0.95) 0%,
        rgba(8,7,6,0.85) 100%
      );
    }

    .content {
      max-width: 100%;
      padding-inline: clamp(20px, 5vw, 40px);
    }

    .heading {
      font-size: clamp(2.4rem, 10vw, 3.6rem);
    }

    /* Trust bar: stack vertically */
    .trustBar {
      flex-direction: column;
    }

    .trustItem {
      flex: none;
      border-right: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      padding: 16px clamp(20px, 5vw, 40px);
    }

    .trustItem:last-child {
      border-bottom: none;
    }
  }

  @media (min-width: 768px) and (max-width: 1023px) {
    .carStage {
      width: 55%;
    }
  }
  ```

- [ ] **Step 3.3: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 3.4: Commit**

  ```bash
  git add src/components/sections/HeroSection.tsx src/components/sections/HeroSection.module.css
  git commit -m "feat: hero — full-viewport dark cinematic with SVG sports car and atmospheric layers"
  ```

---

## Task 4: BookingModal Shell — Layout, State, Sidebar, Step Routing

**Files:**
- Rewrite: `src/components/booking/BookingModal.tsx`
- Rewrite: `src/components/booking/BookingModal.module.css`

This task builds the modal's outer shell: overlay, split-panel frame, dark sidebar, step routing, back/continue navigation. Step content is added in Tasks 5–8.

Key decisions:
- `BookingIntent` interface stays identical — `{ packageName?, categoryLabel?, price? }` — so all existing callers (`page.tsx`, pricing cards) continue to work.
- Local state manages all booking data; nothing is submitted until Step 7.
- API payload shape is unchanged: `name, phone, email, vehicle, service, preferred_date, preferred_time, zip, notes`.
- Sidebar is 212px wide on desktop; hidden on mobile (progress bar replaces it).
- Modal is `min-height: 580px` on desktop, `100dvh` on mobile.

**Booking state type:**

```typescript
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
```

**Step labels:**
```
1 → 'Vehicle & Package'
2 → 'Add-ons'
3 → 'Date & Time'
4 → 'Location'
5 → 'Vehicle Details'
6 → 'Your Information'
7 → 'Review & Confirm'
```

**Price computation helper:**
```typescript
function computePrice(state: BookingState): number | null {
  if (!state.categoryId || !state.packageId) return null;
  const cat = CATEGORIES.find(c => c.id === state.categoryId);
  const pkg = cat?.packages.find(p => p.id === state.packageId);
  if (!pkg) return null;
  return state.vehicleType === 'sedan' ? pkg.price : pkg.xlPrice;
}
```
(`xlPrice` applies to both 'suv' and 'xl' since `XL_SURCHARGE = 30` is already baked into the data.)

- [ ] **Step 4.1: Write BookingModal.tsx — shell only (no step content yet)**

  Replace `src/components/booking/BookingModal.tsx` with:

  ```tsx
  'use client';

  import { useEffect, useRef, useState } from 'react';
  import { createPortal } from 'react-dom';
  import Image from 'next/image';
  import { CATEGORIES, XL_SURCHARGE, ENHANCEMENTS } from '@/lib/pricing-data';
  import { VELAR_PHONE, VELAR_PHONE_DISPLAY } from '@/lib/config';
  import styles from './BookingModal.module.css';

  /* ─── Public interface — unchanged from previous version ───────────────── */
  export interface BookingIntent {
    packageName?: string;
    categoryLabel?: string;
    price?: number;
  }

  interface Props {
    intent: BookingIntent;
    onClose: () => void;
  }

  /* ─── Internal state ───────────────────────────────────────────────────── */
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
    if (!state.categoryId || !state.packageId) return null;
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
      panelRef.current?.querySelector<HTMLElement>('button, input, select, textarea')?.focus();
    }, [step]);

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
          throw new Error(data.error || 'Submission failed');
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
                            className={`${styles.stepRow} ${isActive ? styles.stepActive : ''} ${isDone ? styles.stepDone : ''}`}
                          >
                            <div className={styles.stepNum}>{n}</div>
                            <span className={styles.stepName}>{label}</span>
                          </div>
                          {n < STEPS.length && <div className={styles.stepConnector} />}
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
                      {pkg ? pkg.name : <span className={styles.summaryEmpty}>—</span>}
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
                      <div className={styles.summaryTotalVal} style={{ fontSize: '0.9rem', color: '#2a2218' }}>
                        TBD
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ── WHITE STEP PANEL ── */}
              <div className={styles.stepPanel}>
                {/* Progress bar */}
                <div className={styles.progress}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${(step / STEPS.length) * 100}%` }}
                  />
                </div>

                {/* Step content */}
                <div className={styles.stepContent}>
                  <StepContent
                    step={step}
                    state={state}
                    update={update}
                    todayISO={todayISO}
                    timeSlots={TIME_SLOTS}
                    onSubmit={handleSubmit}
                    submitting={submitting}
                    submitError={submitError}
                  />
                </div>

                {/* Back / Continue */}
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
                      disabled={submitting || !isStepValid(6, state)}
                    >
                      {submitting ? 'Sending…' : 'Confirm Booking'}
                    </button>
                  )}
                </div>

                {/* Close button */}
                <button
                  className={styles.closeBtn}
                  onClick={onClose}
                  aria-label="Close booking"
                  type="button"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                    <path d="M1 1l11 11M12 1L1 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
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

  /* ─── Step content router — filled in Tasks 5–8 ────────────────────────── */
  interface StepContentProps {
    step: number;
    state: BookingState;
    update: (partial: Partial<BookingState>) => void;
    todayISO: string;
    timeSlots: string[];
    onSubmit: () => void;
    submitting: boolean;
    submitError: string;
  }

  function StepContent({ step, state, update, todayISO, timeSlots }: StepContentProps) {
    switch (step) {
      case 1: return <Step1 state={state} update={update} />;
      case 2: return <Step2 state={state} update={update} />;
      case 3: return <Step3 state={state} update={update} todayISO={todayISO} timeSlots={timeSlots} />;
      case 4: return <Step4 state={state} update={update} />;
      case 5: return <Step5 state={state} update={update} />;
      case 6: return <Step6 state={state} update={update} />;
      case 7: return <Step7 state={state} />;
      default: return null;
    }
  }

  /* Step placeholders — replaced in Tasks 5–8 */
  function Step1({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
    return <div style={{padding:'20px',color:'#111'}}>Step 1 — Vehicle &amp; Package (coming in Task 5)</div>;
  }
  function Step2({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
    return <div style={{padding:'20px',color:'#111'}}>Step 2 — Add-ons (coming in Task 6)</div>;
  }
  function Step3({ state, update, todayISO, timeSlots }: { state: BookingState; update: (p: Partial<BookingState>) => void; todayISO: string; timeSlots: string[] }) {
    return <div style={{padding:'20px',color:'#111'}}>Step 3 — Date &amp; Time (coming in Task 6)</div>;
  }
  function Step4({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
    return <div style={{padding:'20px',color:'#111'}}>Step 4 — Location (coming in Task 6)</div>;
  }
  function Step5({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
    return <div style={{padding:'20px',color:'#111'}}>Step 5 — Vehicle Details (coming in Task 7)</div>;
  }
  function Step6({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
    return <div style={{padding:'20px',color:'#111'}}>Step 6 — Your Information (coming in Task 7)</div>;
  }
  function Step7({ state }: { state: BookingState }) {
    return <div style={{padding:'20px',color:'#111'}}>Step 7 — Review &amp; Confirm (coming in Task 8)</div>;
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
          <button className={styles.doneBtn} onClick={onClose} type="button">Done</button>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 4.2: Write BookingModal.module.css — shell layout**

  Replace `src/components/booking/BookingModal.module.css` with:

  ```css
  /* ─── Overlay ─────────────────────────────────────────────────────────────── */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(8, 7, 6, 0.62);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
  }

  @media (max-width: 639px) {
    .overlay {
      align-items: flex-end;
      padding: 0;
    }
  }

  /* ─── Modal frame — split panel ───────────────────────────────────────────── */
  .frame {
    display: flex;
    width: 100%;
    max-width: 940px;
    min-height: 580px;
    max-height: 90dvh;
    border-radius: 18px;
    overflow: hidden;
    box-shadow:
      0 2px 4px rgba(0,0,0,0.06),
      0 12px 40px rgba(0,0,0,0.18),
      0 48px 100px rgba(0,0,0,0.22);
    animation: fadeScale 0.22s cubic-bezier(0.25, 0.1, 0.25, 1) both;
  }

  @keyframes fadeScale {
    from { transform: scale(0.97); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
  }

  @media (max-width: 639px) {
    .frame {
      flex-direction: column;
      border-radius: 20px 20px 0 0;
      min-height: auto;
      max-height: 96dvh;
      animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes slideUp {
      from { transform: translateY(48px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
  }

  /* ─── Dark sidebar ────────────────────────────────────────────────────────── */
  .sidebar {
    width: 212px;
    flex-shrink: 0;
    background: #080806;
    border-right: 1px solid #0f0e0c;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-y: auto;
  }

  .sidebar::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-orange) 0%, rgba(242,106,13,0.2) 50%, transparent 100%);
    opacity: 0.75;
  }

  @media (max-width: 639px) {
    .sidebar {
      display: none;
    }
  }

  .sidebarTop {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .sidebarLogo {
    padding: 26px 20px 20px;
    border-bottom: 1px solid #0f0e0c;
  }

  .sidebarLogoImg {
    height: 34px;
    width: auto;
    display: block;
    opacity: 0.9;
  }

  /* ─── Step list ───────────────────────────────────────────────────────────── */
  .stepList {
    flex: 1;
    padding: 16px 0 10px;
  }

  .stepItem {
    display: flex;
    flex-direction: column;
  }

  .stepRow {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 9px 20px;
  }

  .stepNum {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 1px solid #1e1c18;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.5rem;
    color: #2a2620;
    font-weight: 600;
    flex-shrink: 0;
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }

  .stepActive .stepNum {
    background: var(--color-orange);
    border-color: var(--color-orange);
    color: #fff;
  }

  .stepDone .stepNum {
    background: rgba(242, 106, 13, 0.12);
    border-color: rgba(242, 106, 13, 0.25);
    color: var(--color-orange);
  }

  .stepName {
    font-size: 0.63rem;
    color: #252218;
    letter-spacing: 0.03em;
    transition: color 0.2s;
  }

  .stepActive .stepName {
    color: rgba(255, 255, 255, 0.7);
  }

  .stepDone .stepName {
    color: #332e24;
  }

  .stepConnector {
    width: 1px;
    height: 8px;
    background: #141210;
    margin: 0 0 0 28px;
  }

  /* ─── Booking summary ─────────────────────────────────────────────────────── */
  .summary {
    border-top: 1px solid #0f0e0c;
    padding: 18px 20px 22px;
  }

  .summaryHeader {
    font-size: 0.47rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-orange);
    margin-bottom: 14px;
  }

  .summaryRow {
    margin-bottom: 10px;
  }

  .summaryKey {
    font-size: 0.44rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #1a1814;
    margin-bottom: 3px;
  }

  .summaryVal {
    font-size: 0.64rem;
    color: #4a4438;
  }

  .summaryEmpty {
    color: #1e1c18;
  }

  .summaryTotal {
    margin-top: 14px;
    padding-top: 13px;
    border-top: 1px solid #0f0e0c;
  }

  .summaryTotalKey {
    font-size: 0.44rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #252218;
    margin-bottom: 5px;
  }

  .summaryTotalVal {
    font-size: 1.35rem;
    font-weight: 300;
    letter-spacing: -0.04em;
    color: var(--color-orange);
    line-height: 1;
  }

  .summaryTotalNote {
    font-size: 0.44rem;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #1a1814;
    margin-top: 4px;
  }

  /* ─── White step panel ────────────────────────────────────────────────────── */
  .stepPanel {
    flex: 1;
    background: #fff;
    display: flex;
    flex-direction: column;
    position: relative;
    min-width: 0;
    overflow-y: auto;
  }

  /* ─── Progress bar ────────────────────────────────────────────────────────── */
  .progress {
    height: 3px;
    background: #f2ede6;
    flex-shrink: 0;
  }

  .progressFill {
    height: 100%;
    background: var(--color-orange);
    transition: width 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
  }

  /* ─── Step content area ───────────────────────────────────────────────────── */
  .stepContent {
    flex: 1;
    padding: 36px 40px 24px;
    overflow-y: auto;
  }

  @media (max-width: 639px) {
    .stepContent {
      padding: 28px 24px 20px;
    }
  }

  /* ─── Step header (shared styles — used by step components) ──────────────── */
  .stepEye {
    display: block;
    font-size: 0.52rem;
    font-weight: 600;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--color-orange);
    margin-bottom: 10px;
  }

  .stepHeading {
    font-size: 1.65rem;
    font-weight: 700;
    letter-spacing: -0.028em;
    color: #111;
    margin-bottom: 6px;
    line-height: 1.1;
  }

  .stepSub {
    font-size: 0.79rem;
    color: var(--color-text-muted);
    margin-bottom: 28px;
    line-height: 1.6;
  }

  /* ─── Step footer nav ─────────────────────────────────────────────────────── */
  .stepNav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 40px 28px;
    border-top: 1px solid #f0ebe4;
    flex-shrink: 0;
  }

  @media (max-width: 639px) {
    .stepNav {
      padding: 14px 24px 28px;
      padding-bottom: calc(28px + env(safe-area-inset-bottom));
    }
  }

  .backBtn {
    font-family: var(--font-sans);
    font-size: 0.64rem;
    letter-spacing: 0.09em;
    text-transform: uppercase;
    color: #c8c0b4;
    background: none;
    border: none;
    cursor: pointer;
  }

  .continueBtn {
    font-family: var(--font-sans);
    background: var(--color-orange);
    color: #fff;
    border: none;
    border-radius: 7px;
    padding: 12px 30px;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    box-shadow: 0 4px 18px rgba(242,106,13,0.24);
    transition: opacity 0.2s;
  }

  .continueBtn:hover:not(:disabled) {
    opacity: 0.88;
  }

  .continueBtn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: none;
  }

  /* ─── Close button ────────────────────────────────────────────────────────── */
  .closeBtn {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 30px;
    height: 30px;
    border: none;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #c8c0b4;
    border-radius: 50%;
    transition: color 0.18s, background 0.18s;
    z-index: 10;
  }

  .closeBtn:hover {
    color: #666;
    background: #f5f0ea;
  }

  /* ─── Success state ───────────────────────────────────────────────────────── */
  .success {
    flex: 1;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px 40px;
  }

  .successInner {
    max-width: 400px;
    width: 100%;
  }

  .successEye {
    display: block;
    font-size: 0.59rem;
    font-weight: 600;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-orange);
    margin-bottom: 14px;
  }

  .successTitle {
    font-size: clamp(1.5rem, 4vw, 2rem);
    font-weight: 700;
    letter-spacing: -0.025em;
    color: #111;
    margin-bottom: 12px;
  }

  .successBody {
    font-size: 0.86rem;
    color: var(--color-text-muted);
    line-height: 1.7;
    margin-bottom: 28px;
  }

  .successActions {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }

  .callBtn,
  .textBtn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 0.82rem;
    font-weight: 500;
    text-decoration: none;
    padding: 12px 20px;
    border-radius: 8px;
    flex: 1;
    transition: background 0.2s, color 0.2s;
  }

  .callBtn {
    background: #111;
    color: #fff;
  }

  .callBtn:hover { background: #000; }

  .textBtn {
    background: transparent;
    color: #111;
    border: 1px solid var(--color-border);
  }

  .textBtn:hover {
    border-color: #111;
    background: #f8f6f3;
  }

  .doneBtn {
    font-family: var(--font-sans);
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-text-muted);
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 8px;
    opacity: 0.65;
    transition: opacity 0.18s;
  }

  .doneBtn:hover { opacity: 1; }

  /* ─── Shared step component styles ───────────────────────────────────────── */

  /* Section sub-label */
  .sublabel {
    display: block;
    font-size: 0.52rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #444;
    margin-bottom: 10px;
  }

  /* Vehicle type cards */
  .vehicleTypes {
    display: flex;
    gap: 8px;
    margin-bottom: 26px;
  }

  .vtCard {
    flex: 1;
    border: 1px solid var(--color-border);
    border-radius: 9px;
    padding: 12px 8px;
    text-align: center;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    transition: border-color 0.18s, background 0.18s;
    background: #fff;
  }

  .vtCard:hover:not(.vtSelected) {
    border-color: #ccc;
  }

  .vtSelected {
    background: #111;
    border-color: #111;
  }

  .vtIcon {
    font-size: 1.2rem;
    line-height: 1;
    filter: grayscale(1) opacity(0.4);
    transition: filter 0.18s;
  }

  .vtSelected .vtIcon {
    filter: none;
  }

  .vtName {
    font-size: 0.61rem;
    font-weight: 600;
    color: #888;
    letter-spacing: 0.03em;
    transition: color 0.18s;
  }

  .vtSelected .vtName {
    color: rgba(255, 255, 255, 0.75);
  }

  .vtAdj {
    font-size: 0.54rem;
    color: var(--color-orange);
    font-weight: 500;
  }

  /* Package comparison cols */
  .pkgCols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  @media (max-width: 479px) {
    .pkgCols {
      grid-template-columns: 1fr;
    }
  }

  .pkgCard {
    border: 1px solid var(--color-border);
    border-radius: 11px;
    padding: 18px 16px;
    display: flex;
    flex-direction: column;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: border-color 0.18s, background 0.18s;
    background: #fff;
  }

  .pkgCard:hover:not(.pkgSelected):not(.pkgFeatured) {
    border-color: #ccc;
  }

  .pkgFeatured {
    background: #111;
    border-color: transparent;
  }

  .pkgFeatured::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--color-orange), rgba(242,106,13,0.2) 60%, transparent);
  }

  .pkgSelected {
    border-color: var(--color-orange);
    box-shadow: 0 0 0 1px var(--color-orange);
  }

  .pkgFeatured.pkgSelected {
    border-color: transparent;
    box-shadow: 0 0 0 2px var(--color-orange);
  }

  .pkgBadge {
    position: absolute;
    top: 10px; right: 10px;
    background: var(--color-orange);
    color: #fff;
    font-size: 0.45rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border-radius: 100px;
    padding: 3px 8px;
  }

  .pkgTier {
    font-size: 0.47rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #aaa;
    margin-bottom: 5px;
  }

  .pkgFeatured .pkgTier { color: #2a2218; }

  .pkgName {
    font-size: 1.05rem;
    font-weight: 700;
    letter-spacing: -0.022em;
    color: #111;
    margin-bottom: 8px;
  }

  .pkgFeatured .pkgName { color: #d4ccbf; }

  .pkgFeats {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 14px;
  }

  .pkgFeat {
    font-size: 0.65rem;
    color: #888;
    display: flex;
    align-items: center;
    gap: 6px;
    line-height: 1.3;
  }

  .pkgFeat::before {
    content: '✓';
    color: var(--color-orange);
    font-size: 0.48rem;
    flex-shrink: 0;
  }

  .pkgFeatured .pkgFeat { color: #3a3028; }

  .pkgRule {
    height: 1px;
    background: var(--color-border);
    margin-bottom: 10px;
  }

  .pkgFeatured .pkgRule { background: #1c1812; }

  .pkgPrice {
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: -0.035em;
    color: #111;
    line-height: 1;
  }

  .pkgFeatured .pkgPrice { color: #b8b0a4; }

  .pkgDur {
    font-size: 0.58rem;
    color: #bbb;
    margin-top: 3px;
  }

  .pkgFeatured .pkgDur { color: #222018; }

  /* Category toggle */
  .catToggle {
    display: flex;
    gap: 6px;
    margin-bottom: 20px;
  }

  .catBtn {
    font-family: var(--font-sans);
    flex: 1;
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-align: center;
    border: 1px solid var(--color-border);
    border-radius: 7px;
    padding: 9px 12px;
    cursor: pointer;
    background: #fff;
    color: #888;
    transition: all 0.18s;
  }

  .catBtn:hover:not(.catSelected) {
    border-color: #ccc;
    color: #555;
  }

  .catSelected {
    background: #111;
    border-color: #111;
    color: #fff;
  }

  /* Form field styles */
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 16px;
  }

  .fieldLabel {
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-text-muted);
  }

  .fieldInput,
  .fieldSelect,
  .fieldTextarea {
    font-family: var(--font-sans);
    font-size: 0.9rem;
    color: #111;
    background: #fff;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 10px 13px;
    width: 100%;
    transition: border-color 0.18s;
    appearance: none;
    -webkit-appearance: none;
  }

  .fieldInput::placeholder,
  .fieldTextarea::placeholder {
    color: var(--color-text-muted);
    opacity: 0.55;
  }

  .fieldInput:focus,
  .fieldSelect:focus,
  .fieldTextarea:focus {
    outline: none;
    border-color: #111;
  }

  .fieldSelect {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%237a7068' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round' fill='none'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 13px center;
    padding-right: 34px;
    cursor: pointer;
  }

  .fieldTextarea {
    resize: vertical;
    min-height: 80px;
    line-height: 1.55;
  }

  .fieldRow {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }

  @media (max-width: 479px) {
    .fieldRow {
      grid-template-columns: 1fr;
    }
  }

  /* Enhancement chips */
  .enhancementGrid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .enhChip {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.7rem;
    font-weight: 400;
    border: 1px solid var(--color-border);
    border-radius: 100px;
    padding: 7px 14px;
    cursor: pointer;
    background: #fff;
    color: #555;
    transition: all 0.18s;
    font-family: var(--font-sans);
  }

  .enhChip:hover:not(.enhSelected) {
    border-color: #bbb;
  }

  .enhSelected {
    border-color: var(--color-orange);
    background: rgba(242, 106, 13, 0.06);
    color: #111;
  }

  .enhPrice {
    font-size: 0.62rem;
    color: var(--color-orange);
    font-weight: 500;
  }

  .enhSelected .enhPrice {
    color: var(--color-orange);
  }

  /* Review summary rows */
  .reviewSection {
    margin-bottom: 24px;
  }

  .reviewSectionLabel {
    font-size: 0.52rem;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-orange);
    margin-bottom: 12px;
    display: block;
  }

  .reviewRow {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 8px 0;
    border-bottom: 1px solid #f0ebe4;
    gap: 16px;
  }

  .reviewRow:last-child {
    border-bottom: none;
  }

  .reviewKey {
    font-size: 0.72rem;
    color: var(--color-text-muted);
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }

  .reviewVal {
    font-size: 0.8rem;
    color: #111;
    font-weight: 500;
    text-align: right;
  }

  .reviewTotalRow {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 16px 0 0;
    border-top: 2px solid #f0ebe4;
    margin-top: 8px;
  }

  .reviewTotalKey {
    font-size: 0.72rem;
    font-weight: 600;
    color: #111;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .reviewTotalVal {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--color-orange);
    letter-spacing: -0.03em;
  }

  .errorMsg {
    font-size: 0.82rem;
    color: #b91c1c;
    line-height: 1.5;
    margin-top: 8px;
  }
  ```

- [ ] **Step 4.3: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors. The step placeholder components are typed correctly.

- [ ] **Step 4.4: Commit**

  ```bash
  git add src/components/booking/BookingModal.tsx src/components/booking/BookingModal.module.css
  git commit -m "feat: booking modal — split-panel shell with sidebar, step routing, state management"
  ```

---

## Task 5: Modal Step 1 — Vehicle Type + Package Selection

**Files:**
- Modify: `src/components/booking/BookingModal.tsx` (replace `Step1` placeholder)

Step 1 combines vehicle type selection and package selection on one screen. It uses the existing `CATEGORIES` from `pricing-data.ts`.

UI structure:
1. Category toggle (Interior + Exterior | Interior Only)
2. Vehicle type cards (Sedan/Coupe | SUV/Truck +$30 | XL Vehicle +$30)
3. Package comparison cards (2 packages for selected category)

When `intent` pre-populated `categoryId` and `packageId`, those are pre-selected via `state`.

- [ ] **Step 5.1: Replace `Step1` placeholder in BookingModal.tsx**

  Find the `Step1` placeholder function and replace it:

  ```tsx
  function Step1({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
    const selectedCat = CATEGORIES.find(c => c.id === state.categoryId) ?? CATEGORIES[0];

    function selectCategory(id: string) {
      // Reset package when switching category
      update({ categoryId: id, packageId: null });
    }

    return (
      <>
        <span className={styles.stepEye}>Step 1 of 7</span>
        <h3 className={styles.stepHeading}>Your vehicle and service level.</h3>
        <p className={styles.stepSub}>This helps us give you accurate pricing before you confirm.</p>

        {/* Category toggle */}
        <span className={styles.sublabel}>Service Type</span>
        <div className={styles.catToggle}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`${styles.catBtn} ${state.categoryId === cat.id ? styles.catSelected : ''}`}
              onClick={() => selectCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Vehicle type */}
        <span className={styles.sublabel}>Vehicle Size</span>
        <div className={styles.vehicleTypes}>
          {([
            { type: 'sedan', label: 'Sedan / Coupe', icon: '🚗', adj: null },
            { type: 'suv',   label: 'SUV / Truck',   icon: '🚙', adj: '+$30' },
            { type: 'xl',    label: 'XL Vehicle',    icon: '🚐', adj: '+$30' },
          ] as const).map(({ type, label, icon, adj }) => (
            <div
              key={type}
              role="button"
              tabIndex={0}
              className={`${styles.vtCard} ${state.vehicleType === type ? styles.vtSelected : ''}`}
              onClick={() => update({ vehicleType: type })}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') update({ vehicleType: type }); }}
            >
              <span className={styles.vtIcon}>{icon}</span>
              <span className={styles.vtName}>{label}</span>
              {adj && <span className={styles.vtAdj}>{adj}</span>}
            </div>
          ))}
        </div>

        {/* Package cards */}
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
                className={`${styles.pkgCard} ${pkg.isFeatured ? styles.pkgFeatured : ''} ${isSelected ? styles.pkgSelected : ''}`}
                onClick={() => update({ packageId: pkg.id, categoryId: selectedCat.id })}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') update({ packageId: pkg.id, categoryId: selectedCat.id }); }}
              >
                {pkg.isFeatured && <div className={styles.pkgBadge}>Most Popular</div>}
                <div className={styles.pkgTier}>{selectedCat.label}</div>
                <div className={styles.pkgName}>{pkg.name}</div>
                <div className={styles.pkgFeats}>
                  {topFeatures.map(f => (
                    <div key={f} className={styles.pkgFeat}>{f}</div>
                  ))}
                </div>
                <div className={styles.pkgRule} />
                <div className={styles.pkgPrice}>
                  ${state.vehicleType ? displayPrice : pkg.price}
                </div>
                <div className={styles.pkgDur}>{pkg.duration}</div>
              </div>
            );
          })}
        </div>
      </>
    );
  }
  ```

- [ ] **Step 5.2: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 5.3: Commit**

  ```bash
  git add src/components/booking/BookingModal.tsx
  git commit -m "feat: booking modal step 1 — vehicle type selector + package comparison"
  ```

---

## Task 6: Modal Steps 2, 3, 4 — Add-ons, Date/Time, Location

**Files:**
- Modify: `src/components/booking/BookingModal.tsx` (replace Step2, Step3, Step4 placeholders)

- [ ] **Step 6.1: Replace `Step2` placeholder — Add-ons**

  ```tsx
  function Step2({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
    function toggleEnhancement(name: string) {
      update({
        enhancements: state.enhancements.includes(name)
          ? state.enhancements.filter(e => e !== name)
          : [...state.enhancements, name],
      });
    }

    return (
      <>
        <span className={styles.stepEye}>Step 2 of 7</span>
        <h3 className={styles.stepHeading}>Anything else we can do?</h3>
        <p className={styles.stepSub}>Optional add-ons — select any that apply. All are optional.</p>

        <div className={styles.enhancementGrid}>
          {ENHANCEMENTS.map(e => {
            const isSelected = state.enhancements.includes(e.name);
            return (
              <button
                key={e.name}
                type="button"
                className={`${styles.enhChip} ${isSelected ? styles.enhSelected : ''}`}
                onClick={() => toggleEnhancement(e.name)}
              >
                {e.name}
                <span className={styles.enhPrice}>{e.price}</span>
              </button>
            );
          })}
        </div>
      </>
    );
  }
  ```

- [ ] **Step 6.2: Replace `Step3` placeholder — Date & Time**

  ```tsx
  function Step3({
    state, update, todayISO, timeSlots
  }: { state: BookingState; update: (p: Partial<BookingState>) => void; todayISO: string; timeSlots: string[] }) {
    return (
      <>
        <span className={styles.stepEye}>Step 3 of 7</span>
        <h3 className={styles.stepHeading}>When works for you?</h3>
        <p className={styles.stepSub}>We&apos;ll confirm availability and reach out to schedule.</p>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="bk-date">Preferred Date</label>
            <input
              className={styles.fieldInput}
              id="bk-date"
              name="preferred_date"
              type="date"
              required
              min={todayISO}
              value={state.preferredDate}
              onChange={e => update({ preferredDate: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="bk-time">Preferred Time</label>
            <select
              className={styles.fieldSelect}
              id="bk-time"
              name="preferred_time"
              value={state.preferredTime}
              onChange={e => update({ preferredTime: e.target.value })}
            >
              {timeSlots.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </>
    );
  }
  ```

- [ ] **Step 6.3: Replace `Step4` placeholder — Location**

  ```tsx
  function Step4({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
    return (
      <>
        <span className={styles.stepEye}>Step 4 of 7</span>
        <h3 className={styles.stepHeading}>Where are you located?</h3>
        <p className={styles.stepSub}>We serve Dallas and surrounding areas. Enter your ZIP to confirm coverage.</p>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="bk-zip">ZIP Code</label>
          <input
            className={styles.fieldInput}
            id="bk-zip"
            name="zip"
            type="text"
            required
            placeholder="75201"
            inputMode="numeric"
            maxLength={5}
            pattern="[0-9]{5}"
            value={state.zip}
            onChange={e => update({ zip: e.target.value.replace(/\D/g, '').slice(0, 5) })}
          />
        </div>
      </>
    );
  }
  ```

- [ ] **Step 6.4: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 6.5: Commit**

  ```bash
  git add src/components/booking/BookingModal.tsx
  git commit -m "feat: booking modal steps 2-4 — add-ons, date/time, location"
  ```

---

## Task 7: Modal Steps 5, 6 — Vehicle Details + Contact Info

**Files:**
- Modify: `src/components/booking/BookingModal.tsx` (replace Step5, Step6 placeholders)

- [ ] **Step 7.1: Replace `Step5` placeholder — Vehicle Details**

  ```tsx
  function Step5({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
    return (
      <>
        <span className={styles.stepEye}>Step 5 of 7</span>
        <h3 className={styles.stepHeading}>Tell us about your vehicle.</h3>
        <p className={styles.stepSub}>Year, make, and model helps us arrive prepared.</p>

        <div className={styles.field}>
          <label className={styles.fieldLabel} htmlFor="bk-vehicle">Year, Make, Model</label>
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
  ```

- [ ] **Step 7.2: Replace `Step6` placeholder — Contact Info**

  ```tsx
  function Step6({ state, update }: { state: BookingState; update: (p: Partial<BookingState>) => void }) {
    return (
      <>
        <span className={styles.stepEye}>Step 6 of 7</span>
        <h3 className={styles.stepHeading}>How do we reach you?</h3>
        <p className={styles.stepSub}>We&apos;ll confirm and coordinate via phone or email.</p>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="bk-name">Full Name</label>
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
            <label className={styles.fieldLabel} htmlFor="bk-phone">Phone</label>
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
          <label className={styles.fieldLabel} htmlFor="bk-email">Email Address</label>
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
            Notes <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, opacity: 0.6 }}>(optional)</span>
          </label>
          <textarea
            className={styles.fieldTextarea}
            id="bk-notes"
            name="notes"
            placeholder="Vehicle condition, location details, gate codes, anything helpful…"
            rows={3}
            value={state.notes}
            onChange={e => update({ notes: e.target.value })}
          />
        </div>
      </>
    );
  }
  ```

- [ ] **Step 7.3: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 7.4: Commit**

  ```bash
  git add src/components/booking/BookingModal.tsx
  git commit -m "feat: booking modal steps 5-6 — vehicle details and contact information"
  ```

---

## Task 8: Modal Step 7 — Review, Submit, Success

**Files:**
- Modify: `src/components/booking/BookingModal.tsx` (replace Step7 placeholder)

Step 7 shows a summary of all collected data, the estimated total, and the confirm button. Submitting sends the API request; on success, `SuccessState` renders.

- [ ] **Step 8.1: Replace `Step7` placeholder — Review & Confirm**

  ```tsx
  function Step7({ state }: { state: BookingState }) {
    const cat = CATEGORIES.find(c => c.id === state.categoryId);
    const pkg = cat?.packages.find(p => p.id === state.packageId);
    const price = (() => {
      if (!pkg) return null;
      return state.vehicleType === 'sedan' ? pkg.price : pkg.xlPrice;
    })();
    const vehicleLabel =
      state.vehicleType === 'sedan' ? 'Sedan / Coupe' :
      state.vehicleType === 'suv'   ? 'SUV / Truck' :
      state.vehicleType === 'xl'    ? 'XL Vehicle' : '—';

    return (
      <>
        <span className={styles.stepEye}>Step 7 of 7</span>
        <h3 className={styles.stepHeading}>Review your booking.</h3>
        <p className={styles.stepSub}>Confirm the details below. We&apos;ll reach out to finalize.</p>

        <div className={styles.reviewSection}>
          <span className={styles.reviewSectionLabel}>Service</span>
          <div className={styles.reviewRow}>
            <span className={styles.reviewKey}>Package</span>
            <span className={styles.reviewVal}>{cat?.label} — {pkg?.name ?? '—'}</span>
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

        {price != null && (
          <div className={styles.reviewTotalRow}>
            <span className={styles.reviewTotalKey}>Estimated Total</span>
            <span className={styles.reviewTotalVal}>${price}</span>
          </div>
        )}
      </>
    );
  }
  ```

- [ ] **Step 8.2: Wire `submitError` into StepContent and render it in Step 7**

  In the `StepContent` function, pass `submitError` to Step 7:

  ```tsx
  case 7: return <Step7 state={state} submitError={submitError} />;
  ```

  Update `Step7` signature to accept and display `submitError`:

  ```tsx
  function Step7({ state, submitError }: { state: BookingState; submitError: string }) {
    // ... existing body ...
    // Add at the very end, before the closing </>:
    {submitError && <p className={styles.errorMsg}>{submitError}</p>}
  }
  ```

  Update `StepContentProps` to make `submitError` visible to Step7:
  The `StepContent` already receives `submitError` — just pass it through in the `case 7` branch.

- [ ] **Step 8.3: Type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 8.4: Commit**

  ```bash
  git add src/components/booking/BookingModal.tsx
  git commit -m "feat: booking modal step 7 — review summary and confirm submit"
  ```

---

## Task 9: Verification

**Files:** None modified — verification only.

- [ ] **Step 9.1: Full type-check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: 0 errors.

- [ ] **Step 9.2: Start dev server**

  ```bash
  npm run dev
  ```

  Open http://localhost:3000. Verify:

  - [ ] Nav is transparent over the hero, turns dark on scroll
  - [ ] Hero is full-viewport dark with SVG car visible (desktop), text-only (mobile)
  - [ ] "Book Now" in nav is orange
  - [ ] "Book Now" in hero is orange
  - [ ] Clicking "Book Now" opens the multi-step modal
  - [ ] Step 1 shows category toggle, vehicle type cards, package cards
  - [ ] Selecting vehicle type and package enables "Continue →"
  - [ ] Steps 2–7 flow correctly via Continue / Back
  - [ ] Sidebar shows correct step highlight and booking summary updates
  - [ ] On mobile (< 640px): sidebar is hidden, progress bar is visible
  - [ ] ESC closes the modal
  - [ ] Clicking the overlay closes the modal
  - [ ] Pricing section "Book" buttons still open the modal (pre-populated)
  - [ ] StickyMobileCTA still opens the modal
  - [ ] All other sections (WhyVelar, Process, FAQ, FinalCTA, Footer) are visually untouched

- [ ] **Step 9.3: Build check**

  ```bash
  npm run build
  ```

  Expected: build completes with no errors. Warnings about `next/image` missing `alt` dimensions are acceptable.

- [ ] **Step 9.4: Final commit**

  ```bash
  git add -A
  git commit -m "chore: verify — all type checks, dev server, and build pass for hero/nav/modal redesign"
  ```

---

## Self-Review

**Spec coverage check:**

| Requirement | Covered by |
|---|---|
| Nav — dark overlay, transparent over hero | Task 2, IntersectionObserver on `data-hero-sentinel` |
| Nav — image logo (orange version) | Task 1 (logo copy) + Task 2 (Nav.tsx Image component) |
| Nav — orange Book Now CTA | Task 2 `bookBtn` styles |
| Nav — centered links | Task 2 `links` absolute centered |
| Nav — mobile hides links | Task 2 media query |
| Hero — full viewport dark cinematic | Task 3 `min-height: 100vh` + atmospheric layers |
| Hero — SVG sports car visible on desktop | Task 3 CarSVG + highlighted body |
| Hero — orange accent on "you." | Task 3 `orange` class + CSS var |
| Hero — trust bar | Task 3 |
| Hero — car hidden on mobile | Task 3 `carStage` display:none @ <768px |
| Modal — split panel (dark sidebar + white right) | Task 4 |
| Modal — 7 steps | Tasks 4–8 |
| Modal — vehicle type selector | Task 5 |
| Modal — package comparison (matches pricing data) | Task 5 |
| Modal — category toggle (Int+Ext / Interior Only) | Task 5 |
| Modal — add-ons from ENHANCEMENTS | Task 6 Step2 |
| Modal — date/time | Task 6 Step3 |
| Modal — ZIP code | Task 6 Step4 |
| Modal — vehicle description | Task 7 Step5 |
| Modal — contact info (name, phone, email, notes) | Task 7 Step6 |
| Modal — review + confirm | Task 8 Step7 |
| Modal — API payload compatible with existing /api/book | Task 4 `handleSubmit` mapping |
| Modal — intent pre-population | Task 4 `buildInitialState` |
| Modal — ESC key closes | Task 4 `useEffect` keydown |
| Modal — overlay click closes | Task 4 overlay onClick |
| Modal — body scroll lock | Task 4 `useEffect` overflow hidden |
| Modal — success state | Task 4 SuccessState |
| Modal — mobile (sidebar hidden, full-height) | Task 4 CSS @media |
| Pricing section untouched | ✓ Not listed in file map |
| Other sections untouched | ✓ Not listed in file map |

**Placeholder scan:** No TBD/TODO in any task code. Placeholder step functions are clearly labeled as temporary and replaced in Tasks 5–8.

**Type consistency:**
- `BookingState.vehicleType: VehicleType | null` used consistently in Step1, computePrice, handleSubmit, sidebar summary, Step7
- `CATEGORIES` type: `PricingCategory[]` from `pricing-data.ts` — all lookups use `.find()` with null checks
- `BookingIntent` interface is identical to the previous version — no breaking changes to callers
