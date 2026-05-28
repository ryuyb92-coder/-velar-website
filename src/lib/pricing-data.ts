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
  inheritedFrom?: string;
}

export interface PricingCategory {
  id: CategoryId;
  label: string;
  packages: PricingPackage[];
}

export interface Enhancement {
  name: string;
  price: string;
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
        duration: '~2 Hours',
        price: 159,
        xlPrice: 189,
        description: 'Complete maintenance detail for well-kept vehicles.',
        popularAddons: 'Pet hair removal · Engine bay · Hydrophobic spray',
        isFeatured: false,
        features: [
          {
            label: 'Interior',
            items: [
              'Vacuum & air crevice blowout',
              'All surfaces & mats wiped',
              'Seats wiped & refreshed',
              'Interior glass cleaned',
            ],
          },
          {
            label: 'Exterior',
            items: [
              'Safe hand wash',
              'Wheel & tire cleaning',
              'Tire dressing applied',
              'Spot-free dry finish',
            ],
          },
        ],
      },
      {
        id: 'signature',
        name: 'Signature',
        duration: '~3 Hours',
        price: 239,
        xlPrice: 279,
        description: 'Deeper clean with steam, stain treatment, and enhanced protection.',
        popularAddons: 'Pet hair removal · Seat shampoo extraction · Odor treatment',
        isFeatured: true,
        inheritedFrom: 'Essential',
        features: [
          {
            label: 'Interior',
            items: [
              '2-step deep vacuum',
              'Full steam cleaning & sanitization',
              'Light stain treatment',
              'Leather cleaning & conditioning',
            ],
          },
          {
            label: 'Exterior',
            items: [
              'Pre-wash contaminant treatment',
              'Deep wheel & tire cleaning',
              'Hydrophobic spray protection',
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
        id: 'cabin-refresh',
        name: 'Cabin Refresh',
        duration: '~1.5–2 Hours',
        price: 179,
        xlPrice: 209,
        description: 'Interior refresh for well-maintained cabins.',
        popularAddons: 'Pet hair removal · Odor treatment · Seat extraction',
        isFeatured: false,
        features: [
          {
            label: 'Interior',
            items: [
              'Vacuum & air crevice blowout',
              'All surfaces & mats wiped',
              'Seats wiped & refreshed',
              'Interior glass cleaned',
              'Light steam sanitation',
            ],
          },
        ],
      },
      {
        id: 'deep-interior-reset',
        name: 'Deep Interior Reset',
        duration: '~2.5–4 Hours',
        price: 279,
        xlPrice: 309,
        description: 'Full interior restoration for vehicles needing a deeper reset.',
        popularAddons: 'Pet hair removal · Odor treatment · Headliner treatment',
        isFeatured: true,
        inheritedFrom: 'Cabin Refresh',
        features: [
          {
            label: 'Interior',
            items: [
              '2-step deep vacuum',
              'Full steam cleaning',
              'Shampoo extraction',
              'Light to moderate stain treatment',
              'Leather cleaning & conditioning',
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
