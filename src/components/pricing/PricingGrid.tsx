import type { PricingPackage } from '@/lib/pricing-data';
import type { BookingIntent } from '@/components/booking/BookingModal';
import PricingCard from './PricingCard';
import styles from './PricingGrid.module.css';

interface Props {
  packages: PricingPackage[];
  isXL: boolean;
  categoryLabel: string;
  onBook: (intent: BookingIntent) => void;
}

export default function PricingGrid({ packages, isXL, categoryLabel, onBook }: Props) {
  return (
    <div className={styles.grid} data-count={packages.length}>
      {packages.map((pkg) => (
        <div
          key={pkg.id}
          className={styles.cardWrapper}
          data-featured={pkg.isFeatured ? 'true' : undefined}
        >
          <PricingCard
            pkg={pkg}
            isXL={isXL}
            categoryLabel={categoryLabel}
            onBook={onBook}
          />
        </div>
      ))}
    </div>
  );
}
