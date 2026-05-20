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
      {groups.map((group) => (
        <div key={group.label} className={styles.group}>
          {groups.length > 1 && (
            <span className={styles.groupLabel}>{group.label}</span>
          )}
          <ul className={styles.list}>
            {group.items.map((item) => (
              <li key={item} className={styles.item}>
                <span className={styles.check} aria-hidden="true">
                  <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                    <path d="M1 5l3.5 3.5L12 1" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
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
