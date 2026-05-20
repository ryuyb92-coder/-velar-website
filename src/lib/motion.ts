// Central motion configuration for VELAR.
// Import from here, not directly from framer-motion, to enforce restraint.

import type { Variants } from 'framer-motion';

export { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
export type { Variants, Transition } from 'framer-motion';

// Standard durations
export const DURATION = {
  fast: 0.2,
  base: 0.4,
  slow: 0.6,
  cinematic: 0.9,
} as const;

// Standard easings — prefer smooth deceleration, never bouncy
export const EASE = {
  premium: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
  reveal: [0.16, 1, 0.3, 1] as [number, number, number, number],
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
};

// Section fade-up: the primary scroll reveal pattern
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE.reveal },
  },
};

// Subtle fade only — for elements that shouldn't move, just appear
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.base, ease: EASE.premium },
  },
};

// Staggered container — children animate in sequence
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Pricing card reveal — slightly more presence than a plain fadeUp
export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE.reveal },
  },
};

// XL toggle price number swap
export const priceSwap: Variants = {
  exit: { opacity: 0, y: -8, transition: { duration: DURATION.fast, ease: EASE.exit } },
  enter: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE.reveal } },
};
