import type { FeatureGroup } from '@/lib/pricing-data';
import styles from './FeatureList.module.css';

interface Props {
  groups: FeatureGroup[];
  dark?: boolean;
}

export default function FeatureList({ groups, dark = false }: Props) {
  // Flatten all groups into a single list — no group labels rendered
  const allItems = groups.flatMap(g => g.items);

  return (
    <ul className={`${styles.list} ${dark ? styles.dark : ''}`}>
      {allItems.map((item) => (
        <li key={item} className={styles.item}>
          <span className={styles.check} aria-hidden="true">
            <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
              <path d="M1 4.5l3 3L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}
