import React, { useState } from 'react';
import { Schema, JSON } from '../src/models/schema';
import SchemaMold from '../src/components/SchemaMold/SchemaMold';
import './globals.d.ts';
import styles from './App.module.css';

const personSchema: Schema = {
  kind: 'object',
  label: 'Person',
  order: ['name', 'age', 'subscribe', 'favorites'],
  properties: {
    name: { kind: 'string', label: 'Full name', required: true, minLength: 1 },
    age: { kind: 'number', label: 'Age', required: true, min: 0, max: 150 },
    subscribe: { kind: 'boolean', label: 'Subscribe to newsletter?' },
    favorites: {
      kind: 'object',
      label: 'Favorites',
      properties: {
        color: { kind: 'string', label: 'Favorite color' },
        foods: {
          kind: 'array',
          label: 'Favorite foods',
          items: { kind: 'string', label: 'Food' },
        },
      },
    },
  },
};

const handleSubmit = (json: JSON) => {
  console.log('Valid JSON:', json); // eslint-disable-line no-console
};

export default function App() {
  const [data, setData] = useState<JSON>({});
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <h1 className={styles.title}>Demo</h1>

        <div className={styles.items}>
          <SchemaMold
            className={styles.item}
            onChange={setData}
            onSubmit={handleSubmit}
            schema={personSchema}
            value={data}
          />
        </div>
      </div>
    </div>
  );
}
