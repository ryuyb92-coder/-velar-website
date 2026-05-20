import { VELAR_PHONE, VELAR_PHONE_DISPLAY } from '@/lib/config';
import styles from './Footer.module.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        <div className={styles.brand}>
          <span className={styles.logoMark}>VELAR</span>
          <span className={styles.logoSub}>Mobile Detailing — Dallas, TX</span>
        </div>

        <div className={styles.links}>
          <a href="#pricing" className={styles.link}>Pricing</a>
          <a href="#faq" className={styles.link}>FAQ</a>
          <a href={`tel:+1${VELAR_PHONE}`} className={styles.link}>
            {VELAR_PHONE_DISPLAY}
          </a>
        </div>

        <p className={styles.copy}>
          © {year} VELAR. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
