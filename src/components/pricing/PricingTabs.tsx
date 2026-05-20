'use client';

import type { CategoryId, PricingCategory } from '@/lib/pricing-data';
import styles from './PricingTabs.module.css';

interface Props {
  categories: PricingCategory[];
  activeId: CategoryId;
  onSelect: (id: CategoryId) => void;
}

export default function PricingTabs({ categories, activeId, onSelect }: Props) {
  return (
    <div className={styles.wrapper} role="tablist" aria-label="Service category">
      {categories.map((cat) => (
        <button
          key={cat.id}
          role="tab"
          aria-selected={cat.id === activeId}
          className={`${styles.tab} ${cat.id === activeId ? styles.active : ''}`}
          onClick={() => onSelect(cat.id)}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}
