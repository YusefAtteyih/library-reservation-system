/**
 * Remove duplicate values from an array
 * @param array - Input array
 * @returns New array with unique values
 */
export const unique = <T>(array: T[]): T[] => {
  return [...new Set(array)];
};

/**
 * Remove falsy values from an array
 * @param array - Input array
 * @returns New array without falsy values
 */
export const compact = <T>(array: (T | null | undefined | false | '' | 0)[]): T[] => {
  return array.filter(Boolean) as T[];
};

/**
 * Flatten a nested array
 * @param array - Input array
 * @returns Flattened array
 */
export const flatten = <T>(array: T[][]): T[] => {
  return array.flat();
};

/**
 * Deep flatten a nested array
 * @param array - Input array
 * @returns Deeply flattened array
 */
export const flattenDeep = <T>(array: any[]): T[] => {
  return array.flat(Infinity) as T[];
};

/**
 * Find the difference between two arrays
 * @param array1 - First array
 * @param array2 - Second array
 * @returns Array of values that are in array1 but not in array2
 */
export const difference = <T>(array1: T[], array2: T[]): T[] => {
  return array1.filter((x) => !array2.includes(x));
};

/**
 * Find the intersection of two arrays
 * @param array1 - First array
 * @param array2 - Second array
 * @returns Array of values that are in both arrays
 */
export const intersection = <T>(array1: T[], array2: T[]): T[] => {
  return array1.filter((x) => array2.includes(x));
};

/**
 * Find the union of two arrays
 * @param array1 - First array
 * @param array2 - Second array
 * @returns Array of unique values from both arrays
 */
export const union = <T>(array1: T[], array2: T[]): T[] => {
  return [...new Set([...array1, ...array2])];
};

/**
 * Group an array of objects by a key
 * @param array - Array of objects
 * @param key - Key to group by
 * @returns Object with grouped arrays
 */
export const groupBy = <T extends Record<string, any>, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T[]> => {
  return array.reduce((acc, item) => {
    const groupKey = String(item[key]);
    if (!acc[groupKey]) {
      acc[groupKey] = [];
    }
    acc[groupKey].push(item);
    return acc;
  }, {} as Record<string, T[]>);
};

/**
 * Sort an array of objects by a key
 * @param array - Array of objects
 * @param key - Key to sort by
 * @param order - Sort order ('asc' or 'desc')
 * @returns New sorted array
 */
export const sortBy = <T extends Record<string, any>, K extends keyof T>(
  array: T[],
  key: K,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Chunk an array into smaller arrays of a specified size
 * @param array - Input array
 * @param size - Size of each chunk
 * @returns Array of chunks
 */
export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Shuffle an array (Fisher-Yates algorithm)
 * @param array - Input array
 * @returns New shuffled array
 */
export const shuffle = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Get a random element from an array
 * @param array - Input array
 * @returns Random element or undefined if array is empty
 */
export const sample = <T>(array: T[]): T | undefined => {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Get n random elements from an array
 * @param array - Input array
 * @param n - Number of elements to get
 * @returns Array of random elements
 */
export const sampleSize = <T>(array: T[], n: number): T[] => {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(n, shuffled.length));
};

/**
 * Remove elements from an array that match a predicate
 * @param array - Input array
 * @param predicate - Function to test each element
 * @returns New array with elements removed
 */
export const remove = <T>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => boolean
): T[] => {
  return array.filter((item, index, arr) => !predicate(item, index, arr));
};

/**
 * Create an array of numbers in a range
 * @param start - Start of range (inclusive)
 * @param end - End of range (inclusive)
 * @param step - Step between numbers (default: 1)
 * @returns Array of numbers
 */
export const range = (start: number, end: number, step: number = 1): number[] => {
  const result: number[] = [];
  for (let i = start; i <= end; i += step) {
    result.push(i);
  }
  return result;
};

/**
 * Zip multiple arrays together
 * @param arrays - Arrays to zip
 * @returns New array of grouped elements
 */
export const zip = <T>(...arrays: T[][]): T[][] => {
  const maxLength = Math.max(...arrays.map(arr => arr.length));
  return Array.from({ length: maxLength }, (_, i) =>
    arrays.map(arr => arr[i])
  );
};

/**
 * Unzip a zipped array
 * @param array - Zipped array
 * @returns Array of unzipped arrays
 */
export const unzip = <T>(array: T[][]): T[][] => {
  return array[0].map((_, i) => array.map(arr => arr[i]));
};

/**
 * Find the index of the maximum value in an array
 * @param array - Input array
 * @returns Index of maximum value or -1 if array is empty
 */
export const indexOfMax = (array: number[]): number => {
  if (array.length === 0) return -1;
  return array.indexOf(Math.max(...array));
};

/**
 * Find the index of the minimum value in an array
 * @param array - Input array
 * @returns Index of minimum value or -1 if array is empty
 */
export const indexOfMin = (array: number[]): number => {
  if (array.length === 0) return -1;
  return array.indexOf(Math.min(...array));
};

/**
 * Count the occurrences of each value in an array
 * @param array - Input array
 * @returns Object with value counts
 */
export const countBy = <T>(array: T[]): Record<string, number> => {
  return array.reduce((acc, item) => {
    const key = String(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

/**
 * Create an array of key-value pairs from an object
 * @param obj - Input object
 * @returns Array of key-value pairs
 */
export const entries = <T extends Record<string, any>>(
  obj: T
): [keyof T, T[keyof T]][] => {
  return Object.entries(obj) as [keyof T, T[keyof T]][];
};

/**
 * Create an object from an array of key-value pairs
 * @param entries - Array of key-value pairs
 * @returns Object
 */
export const fromEntries = <K extends string | number | symbol, V>(
  entries: [K, V][]
): Record<K, V> => {
  return entries.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as Record<K, V>);
};

/**
 * Create an array of values from an object
 * @param obj - Input object
 * @returns Array of values
 */
export const values = <T extends Record<string, any>>(obj: T): T[keyof T][] => {
  return Object.values(obj);
};

/**
 * Create an array of keys from an object
 * @param obj - Input object
 * @returns Array of keys
 */
export const keys = <T extends Record<string, any>>(obj: T): (keyof T)[] => {
  return Object.keys(obj) as (keyof T)[];
};

/**
 * Map over object values
 * @param obj - Input object
 * @param fn - Mapping function
 * @returns New object with mapped values
 */
export const mapValues = <T extends Record<string, any>, U>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => U
): Record<keyof T, U> => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value, key)])
  ) as Record<keyof T, U>;
};

/**
 * Map over object keys
 * @param obj - Input object
 * @param fn - Mapping function
 * @returns New object with mapped keys
 */
export const mapKeys = <T extends Record<string, any>, U extends string | number | symbol>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => U
): Record<U, T[keyof T]> => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [fn(value, key), value])
  ) as Record<U, T[keyof T]>;
};

/**
 * Pick specific properties from an object
 * @param obj - Input object
 * @param keys - Keys to pick
 * @returns New object with only the picked properties
 */
export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  return keys.reduce((acc, key) => {
    if (key in obj) {
      acc[key] = obj[key];
    }
    return acc;
  }, {} as Pick<T, K>);
};

/**
 * Omit specific properties from an object
 * @param obj - Input object
 * @param keys - Keys to omit
 * @returns New object without the omitted properties
 */
export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};
