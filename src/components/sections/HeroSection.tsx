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
        <span className={styles.brandMark}>VELAR</span>
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
   Dark metallic body with warm charcoal highlights, roof/shoulder key-light,
   orange tail light glow, 5-spoke alloy wheels, floor reflection.
   IMPORTANT: gradient IDs are prefixed with "v" to avoid conflicts with any
   other SVG gradients on the page.
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

      {/* Hood panel */}
      <path d="M 65 265 L 80 246 Q 96 230 118 220 L 155 210 L 192 202 L 208 200 L 210 205 L 196 208 L 162 216 Q 128 226 112 236 L 96 250 L 82 266 Z" fill="url(#vHoodGrad)"/>

      {/* Upper body shoulder zone */}
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

      {/* Front grille accent */}
      <path d="M 63 265 L 78 267" fill="none" stroke="rgba(242,106,13,0.12)" strokeWidth="1.5"/>

      {/* Door seam */}
      <line x1="436" y1="202" x2="436" y2="274" stroke="rgba(0,0,0,0.45)" strokeWidth="1.5"/>
      <line x1="436" y1="202" x2="436" y2="274" stroke="rgba(255,255,255,0.022)" strokeWidth="0.5"/>

      {/* Mirror */}
      <path d="M 252 175 L 270 170 L 272 183 L 256 188 Z" fill="#0e0d0b" stroke="rgba(255,255,255,0.045)" strokeWidth="0.5"/>

      {/* FRONT WHEEL */}
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

      {/* REAR WHEEL */}
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
