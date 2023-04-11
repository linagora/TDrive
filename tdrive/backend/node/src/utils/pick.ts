/**
 * Picks properties from an input object and return them in a new object
 *
 * @param obj
 * @param keys
 */
export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  return keys.reduce((o, k) => ((o[k] = obj[k]), o), {} as Pick<T, K>);
}
