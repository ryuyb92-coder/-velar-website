import styles from './EnhancementsSection.module.css';

const ADD_ONS = [
  { name: 'Pet Hair Removal',                  price: '+$30–80'  },
  { name: 'Seat & Carpet Shampoo Extraction',  price: '+$50–75'  },
  { name: 'Engine Bay Detail',                 price: '+$50'     },
  { name: 'Headliner Deep Cleaning',           price: '+$50'     },
  { name: 'Odor Treatment',                    price: '+$40'     },
  { name: 'Hydrophobic Spray Protection',      price: '+$40'     },
  { name: 'Leather Conditioning',              price: '+$30'     },
];

function CheckIcon() {
  return (
    <svg width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden="true">
      <path d="M1 5l3.5 3.5L12 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function EnhancementsSection() {
  return (
    <div className={styles.section}>
      <div className={styles.layout}>

        {/* Left — heading block */}
        <div className={styles.leftCol}>
          <h3 className={styles.title}>Popular Add-Ons</h3>
          <p className={styles.subtitle}>
            Additional services available depending on vehicle condition.
          </p>
        </div>

        {/* Right — clean vertical list */}
        <div className={styles.rightCol}>
          {ADD_ONS.map((item) => (
            <div key={item.name} className={styles.row}>
              <span className={styles.check}><CheckIcon /></span>
              <span className={styles.name}>{item.name}</span>
              <span className={styles.price}>{item.price}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
