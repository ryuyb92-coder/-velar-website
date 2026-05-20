'use client';

import styles from './XLToggle.module.css';

interface Props {
  isXL: boolean;
  onChange: (val: boolean) => void;
}

export default function XLToggle({ isXL, onChange }: Props) {
  return (
    <label className={styles.label}>
      <button
        role="switch"
        aria-checked={isXL}
        className={`${styles.toggle} ${isXL ? styles.on : ''}`}
        onClick={() => onChange(!isXL)}
        type="button"
      >
        <span className={styles.thumb} />
      </button>
      <span className={styles.text}>
        My vehicle is a truck or SUV
      </span>
    </label>
  );
}
