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
        description:
          "A complete maintenance detail designed for regularly maintained vehicles needing a clean, refreshed reset inside and out.",
        popularAddons:
          'Pet Hair Removal (+$30–80) · Engine Bay Detail (+$50) · Hydrophobic Spray Protection (+$40)',
        isFeatured: false,
        features: [
          {
            label: 'Interior',
            items: [
              'Professional interior vacuum',
              'Compressed air crevice blowout',
              'Wipe & clean all interior surfaces',
              'Floor mats & carpet refresh',
              'Seats wiped & refreshed',
              'Interior glass & mirrors cleaned',
              'Trunk vacuum & wipe down',
            ],
          },
          {
            label: 'Exterior',
            items: [
              'Safe hand wash',
              'Wheel faces & tires cleaned',
              'Tire dressing applied',
              'Exterior trim refreshed',
              'Door jambs cleaned',
              'Exterior glass cleaned',
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
        description:
          'Our most comprehensive everyday detail featuring deeper interior cleaning, steam sanitization, stain treatment, and enhanced exterior protection.',
        popularAddons:
          'Pet Hair Removal (+$30–80) · Seat Shampoo Extraction (+$50–75) · Engine Bay Detail (+$50) · Odor Treatment (+$40)',
        isFeatured: true,
        inheritedFrom: 'Essential',
        features: [
          {
            label: 'Interior',
            items: [
              '2-step deep interior vacuum',
              'Full interior steam cleaning',
              'Light stain treatment',
              'Leather cleaning & conditioning',
              'Premium matte interior finish',
              'Additional attention to crevices & detail areas',
            ],
          },
          {
            label: 'Exterior',
            items: [
              'Pre-wash exterior treatment',
              'Deep wheel & tire cleaning',
              'Hydrophobic spray protection',
              'Enhanced gloss finish',
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
            label: '',
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
            label: '',
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
