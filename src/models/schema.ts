export type Path = (string | number)[];

export type JSON =
  | boolean
  | number
  | string
  | null
  | { [k: string]: JSON }
  | JSON[];

export type EnumOption = {
  label?: string;
  value: string;
};

export type BaseField = {
  label?: string;
  note?: string;
  required?: boolean;
};

export type ArrayField = BaseField & {
  kind: 'array';
  items: Field;
  minItems?: number;
  maxItems?: number;
};

export type BooleanField = BaseField & {
  kind: 'boolean';
};

export type EnumField = BaseField & {
  kind: 'enum';
  options: EnumOption[];
};

export type NumberField = BaseField & {
  kind: 'number';
  min?: number;
  max?: number;
  step?: number;
};

export type ObjectField = BaseField & {
  kind: 'object';
  properties: Record<string, Field>;
  order?: string[];
};

export type StringField = BaseField & {
  kind: 'string';
  placeholder?: string;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
};

export type Field =
  | ArrayField
  | BooleanField
  | EnumField
  | NumberField
  | ObjectField
  | StringField;

export type Schema = ObjectField;
