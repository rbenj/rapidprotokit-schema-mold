import { useState } from 'react';
import './SchemaMold.css';

export interface SchemaMoldProps { }; // eslint-disable-line @typescript-eslint/no-empty-object-type

function SchemaMold() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Schema Mold</h1>
      <div className="card">
        <button onClick={() => setCount(count => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  );
}

export default SchemaMold;
