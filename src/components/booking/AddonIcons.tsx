/**
 * Premium monochrome SVG icons for add-on services.
 * All icons: 20×20 viewBox, stroke-based, 1.5px stroke, currentColor.
 * Color is set entirely by CSS — default muted, orange when selected.
 */

interface IconProps {
  className?: string;
}

export function PetIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      {/* Central paw pad */}
      <ellipse cx="10" cy="14" rx="3.2" ry="2.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Three toe pads */}
      <ellipse cx="6.2" cy="9.8" rx="1.4" ry="1.8" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="10" cy="8.8" rx="1.4" ry="1.8" stroke="currentColor" strokeWidth="1.5"/>
      <ellipse cx="13.8" cy="9.8" rx="1.4" ry="1.8" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export function AirflowIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M2 6.5C4.5 5 7 8 9.5 6.5C12 5 14.5 7.5 17 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2 10.5C4.5 9 7 12 9.5 10.5C12 9 14.5 11.5 17 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2 14.5C4.5 13 7 16 9.5 14.5C12 13 14.5 15.5 17 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function SeatIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      {/* Seat cushion */}
      <path d="M3 17L3 13Q3 11 6 11L14 11Q17 11 17 13L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Back rest */}
      <path d="M6.5 11L7.5 5L12.5 5L13.5 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Headrest */}
      <path d="M8 5Q10 3 12 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function HeadlinerIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      {/* Interior ceiling arc */}
      <path d="M3 15Q10 4 17 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Pillars / mounting points */}
      <path d="M6.5 14L6.5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M13.5 14L13.5 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function BioIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      {/* Droplet outline */}
      <path d="M10 2Q16.5 9.5 16.5 13.5A6.5 6.5 0 0 1 3.5 13.5Q3.5 9.5 10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Plus / sanitation cross */}
      <path d="M10 9.5L10 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M7.5 11.8L12.5 11.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function DropletIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      {/* Water droplet */}
      <path d="M10 2Q17 10 17 13.5A7 7 0 0 1 3 13.5Q3 10 10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Mold/moisture wave */}
      <path d="M7 14Q10 11.5 13 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function EngineIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      {/* Gear hub */}
      <circle cx="10" cy="10" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
      {/* 8 gear teeth */}
      <path d="M10 2.5L10 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 15L10 17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M2.5 10L5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15 10L17.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4.5 4.5L6.2 6.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M13.8 13.8L15.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M15.5 4.5L13.8 6.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6.2 13.8L4.5 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function ClayIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      {/* Buffing pad — concentric circles */}
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
      <circle cx="10" cy="10" r="1.5" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
    </svg>
  );
}

export function HeadlightIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      {/* Headlight lens */}
      <circle cx="7.5" cy="10" r="4" stroke="currentColor" strokeWidth="1.5"/>
      {/* Light beams */}
      <path d="M12.5 7L18.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12.5 10L18.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12.5 13L18.5 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function SwirlIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      {/* Paint swirl / spiral */}
      <path d="M10 17C5 17 3 13.5 3 10.5C3 6.5 6.5 3.5 10 3.5C14 3.5 17 6.5 17 10C17 12.5 15.5 14.5 13 15.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M13 15.5C11 16.5 9 16 8 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <path d="M8 14C7.5 12.5 8 11 10 11C12 11 13 12 12.5 13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    </svg>
  );
}

export function AlertIcon({ className }: IconProps) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      {/* Warning diamond */}
      <path d="M10 1.5L18.5 10L10 18.5L1.5 10Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Exclamation */}
      <path d="M10 7L10 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="10" cy="13.8" r="0.8" fill="currentColor"/>
    </svg>
  );
}

/** Look up an icon component by its string identifier */
export const ADDON_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  pet:        PetIcon,
  airflow:    AirflowIcon,
  seat:       SeatIcon,
  headliner:  HeadlinerIcon,
  bio:        BioIcon,
  droplet:    DropletIcon,
  engine:     EngineIcon,
  clay:       ClayIcon,
  headlight:  HeadlightIcon,
  swirl:      SwirlIcon,
  alert:      AlertIcon,
};
