'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { PricingPackage } from '@/lib/pricing-data';
import type { BookingIntent } from '@/components/booking/BookingModal';
import FeatureList from './FeatureList';
import styles from './PricingCard.module.css';

interface Props {
  pkg: PricingPackage;
  isXL: boolean;
  categoryLabel: string;
  onBook: (intent: BookingIntent) => void;
}

const priceVariants = {
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15 } },
  enter:   { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function PricingCard({ pkg, isXL, categoryLabel, onBook }: Props) {
  const featured = pkg.isFeatured;
  const displayPrice = isXL ? pkg.xlPrice : pkg.price;
  const priceKey = `${pkg.id}-${displayPrice}`;

  return (
    <article className={`${styles.card} ${featured ? styles.featured : styles.standard}`}>

      {/* Most Popular badge — featured only */}
      {featured && (
        <div className={styles.badge}>Most Popular</div>
      )}

      {/* Price */}
      <div className={styles.priceRow}>
        <span className={styles.dollarSign}>$</span>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={priceKey}
            className={styles.price}
            variants={priceVariants}
            initial="enter"
            animate="visible"
            exit="exit"
          >
            {displayPrice}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Duration */}
      <div className={styles.duration}>
        <span className={styles.durationRule} />
        <span className={styles.durationText}>{pkg.duration}</span>
        <span className={styles.durationRule} />
      </div>

      {/* Name */}
      <h3 className={styles.name}>{pkg.name}</h3>

      {/* Description */}
      <p className={styles.description}>{pkg.description}</p>

      {/* Feature header + list */}
      <div className={styles.featureBlock}>
        <span className={styles.includesLabel}>
          {pkg.inheritedFrom
            ? `Includes everything in ${pkg.inheritedFrom}, plus:`
            : 'Includes:'}
        </span>
        <FeatureList groups={pkg.features} />
      </div>

      {/* CTA */}
      <button
        type="button"
        className={`${styles.cta} ${featured ? styles.ctaFeatured : styles.ctaStandard}`}
        onClick={() => onBook({ packageName: pkg.name, categoryLabel, price: displayPrice })}
      >
        Book Now
      </button>
    </article>
  );
}
