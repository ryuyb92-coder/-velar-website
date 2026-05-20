export type CategoryId = 'interior-exterior' | 'interior-only';

export interface FeatureGroup {
  label: string;
  items: string[];
}

export interface PricingPackage {
  id: string;
  name: string;
  duration: string;
  price: number;
  xlPrice: number;
  description: string;
  popularAddons: string;
  features: FeatureGroup[];
  isFeatured: boolean;
  inheritedFrom?: string; // name of the tier below, for "includes everything in X, plus:"
}

export interface PricingCategory {
  id: CategoryId;
  label: string;
  packages: PricingPackage[];
}

export interface Enhancement {
  name: string;
  price: string; // string to allow "Contact Us" or "from $35"
}

export const XL_SURCHARGE = 30;

export const CATEGORIES: PricingCategory[] = [
  {
    id: 'interior-exterior',
    label: 'Interior + Exterior',
    packages: [
      {
        id: 'essential',
        name: 'Essential',
        duration: '2 Hours',
        price: 159,
        xlPrice: 189,
        description:
          "A complete maintenance detail designed for regularly maintained vehicles needing a clean, refreshed reset inside and out. Perfect for preserving your vehicle's appearance with premium-level care and attention.",
        popularAddons:
          'Pet Hair Removal (+$30–80), Engine Bay Detail (+$50), Hydrophobic Spray Protection (+$40)',
        isFeatured: false,
        features: [
          {
            label: 'Interior',
            items: [
              'Professional Interior Vacuum',
              'Compressed Air Crevice Blowout (Vents, Cupholders, Seams, Tight Areas)',
              'Wipe & Clean All Interior Surfaces',
              'Floor Mats & Carpet Refresh',
              'Seats Wiped & Refreshed',
              'Interior Glass & Mirrors Cleaned',
              'Trunk Vacuum & Wipe Down',
            ],
          },
          {
            label: 'Exterior',
            items: [
              'Safe Hand Wash',
              'Wheel Faces & Tires Cleaned',
              'Tire Dressing Applied',
              'Exterior Trim Refreshed',
              'Door Jambs Cleaned',
              'Exterior Glass Cleaned',
              'Spot-Free Dry Finish',
            ],
          },
        ],
      },
      {
        id: 'signature',
        name: 'Signature',
        duration: '3 Hours',
        price: 239,
        xlPrice: 279,
        description:
          'Our most comprehensive everyday detail featuring deeper interior cleaning, steam sanitization, stain treatment, and enhanced exterior protection for vehicles needing a more thorough transformation.',
        popularAddons:
          'Pet Hair Removal (+$30–80), Seat Shampoo Extraction (+$50 Sedan / +$75 SUV), Engine Bay Detail (+$50), Odor Treatment (+$40)',
        isFeatured: true,
        inheritedFrom: 'Essential',
        features: [
          {
            label: 'Interior',
            items: [
              '2-Step Deep Interior Vacuum',
              'Full Interior Steam Cleaning (Seats, Carpets, Floor Mats, Panels & High-Touch Surfaces)',
              'Light Stain Treatment',
              'Leather Cleaning & Conditioning',
              'Premium Matte Interior Finish',
              'Additional Attention to Crevices & Detail Areas',
            ],
          },
          {
            label: 'Exterior',
            items: [
              'Pre-Wash Exterior Treatment (Bugs, Bird Droppings & Road Film)',
              'Deep Wheel & Tire Cleaning',
              'Hydrophobic Spray Protection',
              'Enhanced Gloss Finish',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'interior-only',
    label: 'Interior Only',
    packages: [
      {
        id: 'refresh',
        name: 'Refresh',
        duration: '1.5 Hours',
        price: 129,
        xlPrice: 159,
        description: 'A thorough interior reset for well-maintained vehicles.',
        popularAddons: 'Pet Hair Removal, Seat Cleaning',
        isFeatured: false,
        features: [
          {
            label: 'Interior',
            items: [
              'Professional vacuum — seats, carpets, floor mats',
              'Air blowout — vents, crevices, cupholders',
              'Wipe down all interior surfaces',
              'Light stain treatment',
              'Dress plastic surfaces (matte finish)',
              'Clean windows, mirrors & visor',
            ],
          },
        ],
      },
      {
        id: 'deep-clean',
        name: 'Deep Clean',
        duration: '2.5 Hours',
        price: 199,
        xlPrice: 229,
        description: 'Our most thorough interior service — steam cleaned, shampooed, and conditioned.',
        popularAddons: 'Pet Hair Removal, Ozone Odor Treatment',
        isFeatured: true,
        inheritedFrom: 'Refresh',
        features: [
          {
            label: 'Interior',
            items: [
              '2-step deep professional vacuum',
              'Full steam cleaning — seats, carpets, floor mats, door panels, console',
              'Shampoo & extraction — carpets, floor mats, cloth seats',
              'Heavy stain treatment',
              'Leather conditioning (matte finish)',
            ],
          },
        ],
      },
    ],
  },
];

export const ENHANCEMENTS: Enhancement[] = [
  { name: 'Light Pet Hair Removal', price: '$35' },
  { name: 'Heavy Pet Hair Removal', price: '$69' },
  { name: 'Ozone Odor Treatment', price: '$55' },
  { name: 'Bio Cleaning Fee', price: '$55' },
  { name: 'Mold Treatment', price: 'Contact Us' },
  { name: 'Individual Seat Cleaning', price: '$40' },
  { name: 'Headliner Deep Cleaning', price: '$55' },
  { name: 'Clay Bar Treatment', price: '$55' },
  { name: 'Engine Bay Detail', price: '$65' },
  { name: 'Headlight Restoration (pair)', price: '$110' },
  { name: 'Swirl Mark Removal', price: 'Contact Us' },
  { name: 'Extra Dirty Fee', price: '$50+/hr' },
];
