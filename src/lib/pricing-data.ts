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
        id: 'cabin-refresh',
        name: 'Cabin Refresh',
        duration: '1.5–2 Hours',
        price: 179,
        xlPrice: 209,
        description: 'Well-maintained interiors needing a refreshed, clean cabin reset.',
        popularAddons:
          'Pet Hair Removal (+$30–80), Odor Treatment (+$40), Seat Shampoo Extraction (+$50 Sedan / +$75 SUV)',
        isFeatured: false,
        features: [
          {
            label: 'Interior',
            items: [
              'Professional Interior Vacuum',
              'Compressed Air Crevice Blowout (Vents, Seams, Cupholders & Tight Areas)',
              'Wipe & Clean All Interior Surfaces',
              'Floor Mats Cleaned & Refreshed',
              'Seats Wiped & Refreshed',
              'Interior Glass & Mirrors Cleaned',
              'Trunk Vacuum & Wipe Down',
              'Light Steam Sanitation (High-Touch Areas)',
            ],
          },
        ],
      },
      {
        id: 'deep-interior-reset',
        name: 'Deep Interior Reset',
        duration: '2.5–4 Hours',
        price: 279,
        xlPrice: 309,
        description:
          'Interiors needing deeper restoration, stain treatment, and reset detailing.',
        popularAddons:
          'Pet Hair Removal (+$30–80), Odor Treatment (+$40), Headliner Spot Treatment (+$40), Biohazard Cleanup (+$50+)',
        isFeatured: true,
        inheritedFrom: 'Cabin Refresh',
        features: [
          {
            label: 'Interior',
            items: [
              '2-Step Deep Interior Vacuum',
              'Full Interior Steam Cleaning (Seats, Carpets, Floor Mats, Panels & Console)',
              'Shampoo Extraction (Carpets, Cloth Seats & Floor Mats)',
              'Light/Moderate Stain Treatment',
              'Leather Cleaning & Conditioning',
              'Premium Matte Interior Finish',
              'Additional Attention to Crevices & Detail Areas',
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
