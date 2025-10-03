import React from 'react';
import classNames from 'classnames';
import { setAtPath } from '@/lib/paths';
import { validateField, isValid, type ErrorsByPath } from '@/lib/validate';
import type { Schema, Field, JSON, Path } from '@/models/schema';
import styles from './SchemaMold.module.css';

interface FieldErrorsProps {
  errors: ErrorsByPath;
  path: Path;
}

function FieldErrors({ path, errors }: FieldErrorsProps) {
  const message = errors['/' + path.join('/')] ?? [];
  if (message.length === 0) {
    return null;
  }

  return (
    <div className={styles.error} role="alert">
      {message.join(' ')}
    </div>
  );
}

interface FieldProps {
  errors: ErrorsByPath;
  field: Field;
  onChange: (path: Path, val: JSON) => void;
  path: Path;
  value: JSON | undefined;
}

function StringInput({
  errors,
  field,
  onChange,
  path,
  value,
}: FieldProps) {
  const str = typeof value === 'string' ? value : '';

  return (
    <div>
      {field.label && (
        <label className={styles.label}>{field.label}</label>
      )}

      <input
        onChange={e => onChange(path, e.target.value)}
        placeholder={field.kind === 'string' ? field.placeholder : undefined}
        type="text"
        value={str}
      />

      {field.note && (
        <div className={styles.note}>{field.note}</div>
      )}

      <FieldErrors path={path} errors={errors} />
    </div>
  );
}

function NumberInput({
  errors,
  field,
  onChange,
  path,
  value,
}: FieldProps) {
  const n = typeof value === 'number' ? value : '';
  const min = field.kind === 'number' ? field.min : undefined;
  const max = field.kind === 'number' ? field.max : undefined;
  const step = field.kind === 'number' ? field.step ?? 'any' : 'any';

  return (
    <div>
      {field.label && (
        <label className={styles.label}>{field.label}</label>
      )}

      <input
        max={max}
        min={min}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(path, raw === '' ? null : Number(raw));
        }}
        step={step}
        type="number"
        value={n}
      />

      <FieldErrors path={path} errors={errors} />
    </div>
  );
}

function BooleanInput({
  errors,
  field,
  onChange,
  path,
  value,
}: FieldProps) {
  const checked = value === true;

  return (
    <div>
      <label className={styles.label}>
        <span className={styles.label}>{field.label}</span>
        <input
          checked={checked}
          onChange={e => onChange(path, e.target.checked)}
          type="checkbox"
        />
      </label>

      <FieldErrors path={path} errors={errors} />
    </div>
  );
}

function EnumInput({
  errors,
  field,
  onChange,
  path,
  value,
}: FieldProps) {
  const v = typeof value === 'string' ? value : '';
  const opts = field.kind === 'enum' ? field.options : [];

  return (
    <div>
      {field.label && (
        <label className={styles.label}>{field.label} </label>
      )}

      <select
        onChange={e => onChange(path, e.target.value === '' ? null : e.target.value)}
        value={v}
      >
        <option value="">Choose One</option>
        {opts.map(o => (
          <option key={o.value} value={o.value}>
            {o.label ?? o.value}
          </option>
        ))}
      </select>

      <FieldErrors path={path} errors={errors} />
    </div>
  );
}

function ObjectFieldView({
  errors,
  field,
  onChange,
  path,
  value,
}: FieldProps) {
  const v = (value && typeof value === 'object' && !Array.isArray(value)) ? (value as Record<string, JSON>) : {};
  const order = field.kind === 'object' ? field.order ?? Object.keys(field.properties) : [];
  const props = field.kind === 'object' ? field.properties : {};

  return (
    <fieldset className={styles.fieldset}>
      {field.label && (
        <legend>{field.label}</legend>
      )}

      {order.map(k => (
        <RenderField
          errors={errors}
          field={props[k]}
          key={k}
          onChange={onChange}
          path={[...path, k]}
          value={v[k]}
        />
      ))}
    </fieldset>
  );
}

function ArrayFieldView({
  errors,
  field,
  onChange,
  path,
  value,
}: FieldProps) {
  const arr: JSON[] = Array.isArray(value) ? value : [];
  const add = () => onChange(path, [...arr, null]);
  const remove = (i: number) => onChange(path, arr.filter((_, idx) => idx !== i) as JSON);
  const itemField = field.kind === 'array' ? field.items : null;

  return (
    <div className={styles.arrayFieldOuter}>
      {field.label && (
        <div className={styles.arrayField_label}>{field.label}</div>
      )}

      {arr.map((item, i) => (
        <div key={`${path.join('.')}-${i}`} className={styles.arrayField_item}>
          <div className={styles.arrayField_item_field}>
            {itemField && (
              <RenderField
                errors={errors}
                field={itemField}
                onChange={onChange}
                path={[...path, i]}
                value={item}
              />
            )}
          </div>

          <button type="button" onClick={() => remove(i)}>Remove</button>
        </div>
      ))}

      <button type="button" onClick={add}>Add</button>

      <FieldErrors path={path} errors={errors} />
    </div>
  );
}

function RenderField(props: FieldProps) {
  switch (props.field.kind) {
    case 'string': return <StringInput {...props} />;
    case 'number': return <NumberInput {...props} />;
    case 'boolean': return <BooleanInput {...props} />;
    case 'enum': return <EnumInput {...props} />;
    case 'object': return <ObjectFieldView {...props} />;
    case 'array': return <ArrayFieldView {...props} />;
  }
}

export interface SchemaMoldProps {
  className?: string;
  onChange: (next: JSON) => void;
  onSubmit?: (validJson: JSON) => void;
  schema: Schema;
  value: JSON;
}

export default function SchemaMold({
  className,
  onChange,
  onSubmit,
  schema,
  value,
}: SchemaMoldProps) {
  const errors = validateField(schema, value);
  const handleChange = (path: Path, val: JSON) => onChange(setAtPath(value, path, val));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateField(schema, value);
    if (isValid(errs)) {
      onSubmit?.(value);
    }
  };

  return (
    <form onSubmit={submit} className={classNames(styles.form, className)}>
      <RenderField
        errors={errors}
        field={schema}
        onChange={handleChange}
        path={[]}
        value={value}
      />

      <pre className={styles.output}>
        {JSON.stringify(value ?? {}, null, 2)}
      </pre>

      <button
        className={styles.submitButton}
        disabled={!isValid(errors)}
        type="submit"
      >
        Submit
      </button>
    </form>
  );
}
