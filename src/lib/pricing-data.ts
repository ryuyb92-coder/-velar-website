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
        price: 149,
        xlPrice: 179,
        description: 'A thorough detail for well-maintained vehicles. Inside and out, refreshed.',
        popularAddons: 'Pet Hair Removal, Ceramic Sealant',
        isFeatured: false,
        features: [
          {
            label: 'Interior',
            items: [
              'Professional vacuum — seats, carpets, floor mats',
              'Air blowout — vents, crevices, cupholders',
              'Wipe down all interior surfaces',
              'Clean windows, mirrors & visor',
              'Detail trunk',
            ],
          },
          {
            label: 'Exterior',
            items: [
              'Hand wash & rinse',
              'Wheel & tire cleaning',
              'Dress exterior trim & tires',
              'Clean door jambs',
              'Exterior window cleaning',
            ],
          },
        ],
      },
      {
        id: 'signature',
        name: 'Signature',
        duration: '3 Hours',
        price: 249,
        xlPrice: 279,
        description: 'Our most complete everyday detail — deep steam interior plus exterior paint protection.',
        popularAddons: 'Pet Hair Removal, Engine Bay Detail, Clay Bar',
        isFeatured: true,
        inheritedFrom: 'Essential',
        features: [
          {
            label: 'Interior',
            items: [
              '2-step deep professional vacuum',
              'Full steam cleaning — seats, carpets, floor mats, door panels, console',
              'Light stain treatment',
              'Leather conditioning (matte finish)',
              'Dress plastic surfaces (matte finish)',
            ],
          },
          {
            label: 'Exterior',
            items: [
              'Pre-treatment soak — bug removal, bird droppings, road debris',
              'High-gloss spray wax',
            ],
          },
        ],
      },
      {
        id: 'premier',
        name: 'Premier',
        duration: '4.5 Hours',
        price: 399,
        xlPrice: 429,
        description: 'The complete VELAR treatment — maximum interior restoration plus full paint decontamination.',
        popularAddons: 'Pet Hair Removal, Ozone Odor Treatment',
        isFeatured: false,
        inheritedFrom: 'Signature',
        features: [
          {
            label: 'Interior',
            items: [
              'Shampoo & extraction — carpets, floor mats, cloth seats',
              'Heavy stain treatment',
            ],
          },
          {
            label: 'Exterior',
            items: [
              'Full decontamination wash — iron removal, tar removal, road contaminants',
              'Hybrid ceramic sealant (SiO2)',
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
