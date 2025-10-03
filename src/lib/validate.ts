import type { Field, JSON, Path } from '@/models/schema';

/**
 * Type representing validation errors organized by path.
 * Keys are path strings (e.g., "/user/name"), values are arrays of error messages.
 */
export type ErrorsByPath = Record<string, string[]>;

/**
 * Converts a path array to a string key for error mapping.
 *
 * @example
 * ```typescript
 * keyOf(["user", "name"]); // "/user/name"
 * keyOf(["items", 0]); // "/items/0"
 * ```
 */
function keyOf(path: Path): string {
  return '/' + path.join('/');
}

/**
 * Adds an error message to the errors map for a specific path.
 *
 * @example
 * ```typescript
 * const errors: ErrorsByPath = {};
 * pushErr(errors, ["user", "name"], "This field is required.");
 * // errors now contains: { "/user/name": ["This field is required."] }
 * ```
 */
function pushErr(
  map: ErrorsByPath,
  path: Path,
  msg: string,
) {
  const k = keyOf(path);
  (map[k] ??= []).push(msg);
}

/**
 * Validates a field value against its schema definition and returns any validation errors.
 *
 * Performs comprehensive validation based on the field type and constraints:
 * - Required field validation
 * - String length and pattern validation
 * - Number range validation
 * - Enum value validation
 * - Object property validation (recursive)
 * - Array length and item validation (recursive)
 *
 * @example
 * ```typescript
 * const field: Field = {
 *   kind: 'string',
 *   required: true,
 *   minLength: 3,
 *   maxLength: 50
 * };
 *
 * const errors = validateField(field, "ab", ["user", "name"]);
 * // Returns: { "/user/name": ["Must be at least 3 characters."] }
 *
 * const objectField: Field = {
 *   kind: 'object',
 *   properties: {
 *     name: { kind: 'string', required: true },
 *     age: { kind: 'number', min: 0 }
 *   }
 * };
 *
 * const objErrors = validateField(objectField, { age: -5 }, ["profile"]);
 * // Returns: { "/profile/name": ["This field is required."], "/profile/age": ["Min 0."] }
 * ```
 */
export function validateField(
  field: Field,
  value: JSON | undefined,
  path: Path = [],
): ErrorsByPath {
  const errors: ErrorsByPath = {};

  const isEmpty =
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.length === 0) ||
    (Array.isArray(value) && value.length === 0);

  if (field.required && isEmpty) {
    pushErr(errors, path, 'This field is required.');
    // Continue checking children only if present
  }

  switch (field.kind) {
    case 'string': {
      if (value !== undefined && value !== null) {
        const s = String(value);
        if (field.minLength != null && s.length < field.minLength) {
          pushErr(errors, path, `Must be at least ${field.minLength} characters.`);
        }
        if (field.maxLength != null && s.length > field.maxLength) {
          pushErr(errors, path, `Must be at most ${field.maxLength} characters.`);
        }
        if (field.pattern) {
          const re = new RegExp(field.pattern);
          if (!re.test(s)) {
            pushErr(errors, path, 'Invalid format.');
          }
        }
      }
      break;
    }
    case 'number': {
      if (value !== undefined && value !== null) {
        const n = typeof value === 'number' ? value : Number.NaN;
        if (Number.isNaN(n)) {
          pushErr(errors, path, 'Must be a number.');
        }
        if (field.min != null && n < field.min) {
          pushErr(errors, path, `Must be at least ${field.min}.`);
        }
        if (field.max != null && n > field.max) {
          pushErr(errors, path, `Must be at most ${field.max}.`);
        }
      }
      break;
    }
    case 'enum': {
      if (value !== undefined && value !== null) {
        const s = String(value);
        const allowed = field.options.map(o => o.value);
        if (!allowed.includes(s)) {
          pushErr(errors, path, 'Invalid choice.');
        }
      }
      break;
    }
    case 'boolean':
      // no extra checks
      break;

    case 'object': {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        for (const key of Object.keys(field.properties)) {
          const child = field.properties[key];
          const childVal = (value as Record<string, JSON>)[key];
          Object.assign(errors, validateField(child, childVal, [...path, key]));
        }
      }
      break;
    }

    case 'array': {
      if (value !== undefined && value !== null) {
        if (!Array.isArray(value)) {
          pushErr(errors, path, 'Must be an array.');
        } else {
          if (field.minItems != null && value.length < field.minItems) {
            pushErr(errors, path, `At least ${field.minItems} items.`);
          }
          if (field.maxItems != null && value.length > field.maxItems) {
            pushErr(errors, path, `At most ${field.maxItems} items.`);
          }
          value.forEach((item, i) => {
            Object.assign(errors, validateField(field.items, item as JSON, [...path, i]));
          });
        }
      }
      break;
    }
  }

  return errors;
}

/**
 * Checks if there are any validation errors present.
 *
 * @example
 * ```typescript
 * const errors = { "/user/name": ["This field is required."] };
 * isValid(errors); // false
 *
 * const noErrors = {};
 * isValid(noErrors); // true
 * ```
 */
export function isValid(errors: ErrorsByPath) {
  return Object.keys(errors).length === 0;
}
