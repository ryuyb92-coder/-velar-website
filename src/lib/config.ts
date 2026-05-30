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

// DIAGNOSTIC: expose build-time env var state to the browser console.
// NEXT_PUBLIC_* vars are inlined at BUILD TIME — if this shows empty on production
// it means the Vercel build ran before the env var was added. A fresh build is required.
// Remove after debugging is complete.
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__VELAR_DIAG__ = {
    MAPS_API_KEY_LENGTH: MAPS_API_KEY.length,
    MAPS_API_KEY_SET: MAPS_API_KEY.length > 0,
    MAPS_API_KEY_PREFIX: MAPS_API_KEY.length > 4 ? MAPS_API_KEY.slice(0, 4) : '(empty)',
    BUILD_NOTE: 'NEXT_PUBLIC_* vars are inlined at build time. If empty here, trigger a FRESH Vercel build.',
  };
  console.log('[VELAR Build-time Diag] Run window.__VELAR_DIAG__ in console to inspect env var state.');
  console.log('[VELAR Build-time Diag] MAPS_API_KEY_LENGTH:', MAPS_API_KEY.length, '| SET:', MAPS_API_KEY.length > 0);
}
