// ─── VELAR Business Configuration ─────────────────────────────────────────────
// Set these as environment variables in .env.local before going live:
//   NEXT_PUBLIC_VELAR_PHONE=2145550000
//   NEXT_PUBLIC_VELAR_PHONE_DISPLAY=(214) 555-0000
//   NEXT_PUBLIC_FORMSPREE_ID=your_form_id   ← sign up free at formspree.io

export const VELAR_PHONE = process.env.NEXT_PUBLIC_VELAR_PHONE ?? '2140000000';
export const VELAR_PHONE_DISPLAY =
  process.env.NEXT_PUBLIC_VELAR_PHONE_DISPLAY ?? '(214) 000-0000';

// Formspree form ID (the part after /f/ in your form URL).
// If empty, the form shows a success state but does not actually send.
export const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? '';
