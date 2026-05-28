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
        duration: '2 hrs',
        price: 159,
        xlPrice: 189,
        description: 'Maintenance detail for well-kept vehicles.',
        popularAddons:
          'Pet Hair Removal (+$30–80), Engine Bay Detail (+$65), Hydrophobic Spray (+$40)',
        isFeatured: false,
        features: [
          {
            label: '',
            items: [
              'Interior vacuum',
              'Surfaces & mats wiped',
              'Glass cleaned',
              'Hand wash',
              'Wheels & tires cleaned',
              'Spot-free finish',
            ],
          },
        ],
      },
      {
        id: 'signature',
        name: 'Signature',
        duration: '3 hrs',
        price: 239,
        xlPrice: 279,
        description: 'Deep clean with steam & enhanced protection.',
        popularAddons:
          'Pet Hair Removal (+$30–80), Seat Extraction (+$50–75), Odor Treatment (+$55)',
        isFeatured: true,
        features: [
          {
            label: '',
            items: [
              'Everything in Essential',
              'Deep vacuum & steam clean',
              'Stain treatment',
              'Leather conditioning',
              'Hydrophobic protection',
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
        duration: '1.5–2 hrs',
        price: 179,
        xlPrice: 209,
        description: 'Interior reset for well-maintained cabins.',
        popularAddons:
          'Pet Hair Removal (+$30–80), Odor Treatment (+$55), Seat Extraction (+$50–75)',
        isFeatured: false,
        features: [
          {
            label: '',
            items: [
              'Interior vacuum',
              'Surfaces & mats wiped',
              'Glass cleaned',
              'Steam sanitation',
            ],
          },
        ],
      },
      {
        id: 'deep-interior-reset',
        name: 'Deep Interior Reset',
        duration: '2.5–4 hrs',
        price: 279,
        xlPrice: 309,
        description: 'Full restoration for interiors needing a deeper reset.',
        popularAddons:
          'Pet Hair Removal (+$30–80), Odor Treatment (+$55), Headliner Treatment (+$40)',
        isFeatured: true,
        features: [
          {
            label: '',
            items: [
              'Everything in Cabin Refresh',
              'Deep vacuum',
              'Full steam cleaning',
              'Shampoo extraction',
              'Stain treatment',
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
