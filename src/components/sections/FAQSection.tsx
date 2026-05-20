'use client';

import { useState } from 'react';
import styles from './FAQSection.module.css';

const FAQS = [
  {
    q: 'How long does a detail take?',
    a: 'Depending on the package, a detail takes between 1.5 and 4.5 hours. Each package shows its estimated duration so you can plan your day.',
  },
  {
    q: 'Do I need to be home during the detail?',
    a: "No — you just need to provide access to your vehicle. Most customers drop off their keys and go about their day. We'll reach out when we're done.",
  },
  {
    q: 'What areas of Dallas do you serve?',
    a: 'We serve Dallas and surrounding areas including Plano, Frisco, McKinney, Allen, Richardson, and more. Enter your ZIP at booking and we\'ll confirm service availability.',
  },
  {
    q: 'What products do you use?',
    a: "We use professional-grade supplies — steam cleaners, pH-balanced soaps, and quality protection products on every job. Never off-the-shelf consumer products.",
  },
  {
    q: 'Can I add enhancements after booking?',
    a: "Yes. You can request any enhancement from our list when we arrive. Pricing is listed on the site — no surprises.",
  },
  {
    q: 'When is payment collected?',
    a: 'Payment is collected after the service is complete. We accept all major credit cards and cash.',
  },
] as const;

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  function toggle(i: number) {
    setOpen((prev) => (prev === i ? null : i));
  }

  return (
    <section className={styles.section} id="faq" aria-labelledby="faq-heading">
      <div className={styles.container}>

        <div className={styles.header}>
          <span className={styles.eyebrow}>FAQ</span>
          <h2 className={styles.heading} id="faq-heading">
            Common questions.{' '}
            <span className={styles.headingMuted}>Straight answers.</span>
          </h2>
        </div>

        <dl className={styles.list}>
          {FAQS.map((item, i) => (
            <div key={i} className={styles.item}>
              <dt>
                <button
                  type="button"
                  className={styles.question}
                  onClick={() => toggle(i)}
                  aria-expanded={open === i}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-q-${i}`}
                >
                  <span>{item.q}</span>
                  <ChevronIcon open={open === i} />
                </button>
              </dt>
              <dd
                className={`${styles.answerWrap} ${open === i ? styles.answerOpen : ''}`}
                id={`faq-answer-${i}`}
                role="region"
                aria-labelledby={`faq-q-${i}`}
              >
                <p className={styles.answer}>{item.a}</p>
              </dd>
            </div>
          ))}
        </dl>

      </div>
    </section>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 4.5l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
