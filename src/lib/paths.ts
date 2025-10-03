import type { JSON, Path } from '@/models/schema';

/**
 * Type guard to check if a JSON value is a plain object (not null, not array).
 */
function isObject(v: JSON): v is { [k: string]: JSON } {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Retrieves a value from a JSON object/array at the specified path.
 *
 * Traverses the JSON structure following the path keys. For arrays, numeric keys are used as
 * indices. For objects, string keys are used as property names. Returns undefined if the path
 * doesn't exist or is invalid.
 *
 * @example
 * ```typescript
 * const data = { user: { name: "John", age: 30 }, items: ["a", "b"] };
 * getAtPath(data, ["user", "name"]); // "John"
 * getAtPath(data, ["items", 0]); // "a"
 * getAtPath(data, ["nonexistent"]); // undefined
 * ```
 */
export function getAtPath(root: JSON, path: Path): JSON | undefined {
  let cur: JSON | undefined = root;
  for (const key of path) {
    if (cur === undefined || cur === null) {
      return undefined;
    }
    if (Array.isArray(cur) && typeof key === 'number') {
      cur = cur[key] as JSON | undefined;
    } else if (isObject(cur) && typeof key === 'string') {
      cur = cur[key] as JSON | undefined;
    } else {
      return undefined;
    }
  }
  return cur;
}

/**
 * Sets a value at the specified path in a JSON object/array, creating intermediate structures as
 * needed.
 *
 * Creates a new JSON structure with the value set at the specified path. If the path doesn't
 * exist, intermediate objects/arrays are created. For array indices beyond the current length,
 * null values are inserted to fill the gap.
 *
 * @example
 * ```typescript
 * const data = { user: { name: "John" } };
 * setAtPath(data, ["user", "age"], 30);
 * // Returns: { user: { name: "John", age: 30 } }
 *
 * const arr = ["a", "b"];
 * setAtPath(arr, [5], "f");
 * // Returns: ["a", "b", null, null, null, "f"]
 * ```
 */
export function setAtPath(
  root: JSON,
  path: Path,
  value: JSON,
): JSON {
  if (path.length === 0) {
    return value;
  }
  const [head, ...rest] = path;
  if (typeof head === 'number') {
    const base = Array.isArray(root) ? root.slice() : [];
    const arr: JSON[] = base as JSON[];
    while (arr.length <= head) {
      arr.push(null);
    }
    arr[head] = setAtPath(arr[head] ?? null, rest, value);
    return arr;
  } else {
    const base = isObject(root) ? { ...root } : {};
    base[head] = setAtPath((base[head] ?? null) as JSON, rest, value);
    return base;
  }
}
