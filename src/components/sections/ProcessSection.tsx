import styles from './ProcessSection.module.css';

const STEPS = [
  {
    num: '01',
    title: 'Choose Your Service',
    body: 'Browse our packages and select the right level of care for your vehicle. Transparent pricing — no calls required.',
  },
  {
    num: '02',
    title: 'Book in Minutes',
    body: 'Fill out a short form with your vehicle, location, and preferred date. We confirm availability within a few hours.',
  },
  {
    num: '03',
    title: 'We Handle the Rest',
    body: "We come to you, do the work, and leave your car looking its best. You don't have to lift a finger.",
  },
] as const;

export default function ProcessSection() {
  return (
    <section className={styles.section} aria-labelledby="process-heading">
      <div className={styles.container}>

        <div className={styles.header}>
          <span className={styles.eyebrow}>How It Works</span>
          <h2 className={styles.heading} id="process-heading">
            Three steps.{' '}
            <span className={styles.headingMuted}>That&apos;s it.</span>
          </h2>
        </div>

        <ol className={styles.steps}>
          {STEPS.map((step) => (
            <li key={step.num} className={styles.step}>
              <span className={styles.stepNum} aria-hidden="true">
                {step.num}
              </span>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepBody}>{step.body}</p>
            </li>
          ))}
        </ol>

      </div>
    </section>
  );
}
