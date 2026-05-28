import type { FeatureGroup } from '@/lib/pricing-data';
import styles from './FeatureList.module.css';

interface Props {
  groups: FeatureGroup[];
  inheritedFrom?: string;
  dark?: boolean;
}

export default function FeatureList({ groups, inheritedFrom, dark = false }: Props) {
  return (
    <div className={`${styles.root} ${dark ? styles.dark : ''}`}>
      {inheritedFrom && (
        <p className={styles.inherited}>
          Everything in <strong>{inheritedFrom}</strong>, plus:
        </p>
      )}
      {groups.map((group, i) => (
        <div key={group.label || i} className={styles.group}>
          {group.label && (
            <span className={styles.groupLabel}>{group.label}</span>
          )}
          <ul className={styles.list}>
            {group.items.map((item) => (
              <li key={item} className={styles.item}>
                <span className={styles.check} aria-hidden="true">
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                    <path d="M1 4.5l3 3L11 1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
