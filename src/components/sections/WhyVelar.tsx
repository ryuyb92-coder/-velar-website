import styles from './WhyVelar.module.css';

const POINTS = [
  {
    num: '01',
    title: 'We Come to You',
    body: 'No drive-ins, no drop-offs. We work at your home, office, or wherever your car is parked in Dallas.',
  },
  {
    num: '02',
    title: 'Professional Grade',
    body: 'Every job uses professional-grade supplies and proper technique. The same care on every vehicle, every time.',
  },
  {
    num: '03',
    title: 'Honest Pricing',
    body: 'The price you see is the price you pay. No upsells at the door, no hidden fees, no surprises.',
  },
  {
    num: '04',
    title: 'Backed by Satisfaction',
    body: "We don't leave until the job is done right. Your satisfaction is the standard we hold ourselves to.",
  },
] as const;

export default function WhyVelar() {
  return (
    <section className={styles.section} aria-labelledby="why-heading">
      <div className={styles.container}>

        <div className={styles.header}>
          <span className={styles.eyebrow}>Why VELAR</span>
          <h2 className={styles.heading} id="why-heading">
            Detailing that earns{' '}
            <span className={styles.headingMuted}>your trust.</span>
          </h2>
        </div>

        <ul className={styles.grid} role="list">
          {POINTS.map((p) => (
            <li key={p.num} className={styles.item}>
              <span className={styles.num} aria-hidden="true">{p.num}</span>
              <h3 className={styles.title}>{p.title}</h3>
              <p className={styles.body}>{p.body}</p>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
