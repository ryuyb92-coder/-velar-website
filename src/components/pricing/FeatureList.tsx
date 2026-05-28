import type { FeatureGroup } from '@/lib/pricing-data';
import styles from './FeatureList.module.css';

interface Props {
  groups: FeatureGroup[];
  dark?: boolean;
}

function CheckIcon() {
  return (
    <svg width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden="true">
      <path d="M1 4.5l3 3L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FeatureList({ groups, dark = false }: Props) {
  const hasLabels = groups.some(g => g.label);

  if (!hasLabels) {
    // No labels — single flat list (Interior Only packages)
    const allItems = groups.flatMap(g => g.items);
    return (
      <ul className={styles.list}>
        {allItems.map(item => (
          <li key={item} className={styles.item}>
            <span className={styles.check}><CheckIcon /></span>
            {item}
          </li>
        ))}
      </ul>
    );
  }

  // Grouped list — Interior / Exterior sections
  return (
    <div className={styles.groups}>
      {groups.map((group, i) => (
        <div key={group.label || i} className={styles.group}>
          {group.label && (
            <span className={styles.groupLabel}>{group.label}:</span>
          )}
          <ul className={styles.list}>
            {group.items.map(item => (
              <li key={item} className={styles.item}>
                <span className={styles.check}><CheckIcon /></span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
