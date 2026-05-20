import { ENHANCEMENTS } from '@/lib/pricing-data';
import styles from './EnhancementsSection.module.css';

export default function EnhancementsSection() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>Enhancements</h3>
        <p className={styles.subtitle}>
          Every service can be tailored to your vehicle&apos;s specific needs.
        </p>
      </div>
      <ul className={styles.grid}>
        {ENHANCEMENTS.map((item) => (
          <li key={item.name} className={styles.item}>
            <span className={styles.check} aria-hidden="true">
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path d="M1 4.5l3 3L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className={styles.name}>{item.name}</span>
            <span
              className={styles.price}
              data-contact={item.price === 'Contact Us' ? 'true' : undefined}
            >
              {item.price}
            </span>
          </li>
        ))}
      </ul>
      <p className={styles.note}>
        * Some enhancements are included at higher service tiers.
      </p>
    </section>
  );
}
