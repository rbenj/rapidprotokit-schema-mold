import { useState } from 'react';
import styles from './SchemaMold.module.css';

export interface SchemaMoldProps { label: string };

export default function SchemaMold({ label }: SchemaMoldProps) {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1 className={styles.title}>{label}</h1>
      <div className="card">
        <button onClick={() => setCount(count => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
}
