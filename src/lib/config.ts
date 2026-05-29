// ─── VELAR Business Configuration ─────────────────────────────────────────────
// Set these in .env.local (local dev) and in Vercel environment variables (prod).
//
// NEXT_PUBLIC_* vars are safe to expose to the browser.
// All other vars are server-only (never sent to the browser).
//
// Required for contact CTAs:
//   NEXT_PUBLIC_VELAR_PHONE=2145550000
//   NEXT_PUBLIC_VELAR_PHONE_DISPLAY=(214) 555-0000
//
// Required for booking form → Notion:
//   NOTION_API_KEY=secret_xxxxxxxxxxxx
//   NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

export const VELAR_PHONE = process.env.NEXT_PUBLIC_VELAR_PHONE ?? '2140000000';
export const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
export const VELAR_PHONE_DISPLAY =
  process.env.NEXT_PUBLIC_VELAR_PHONE_DISPLAY ?? '(214) 000-0000';
