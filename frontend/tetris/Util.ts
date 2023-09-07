/**
 * Returns a random integer between min and max, inclusive.
 *
 * @param min The minimum value, inclusive.
 * @param max The maximum value, inclusive.
 * @returns A random integer between min and max, inclusive.
 */
export const bounded = (min: number, max: number, value: number): number => {
  return Math.min(Math.max(min, value), max);
};

/**
 * Shuffles the given array in place using the Fisher-Yates algorithm.
 */
export const shuffle = (arr: any[]): any[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    swap(arr, i, Math.floor(Math.random() * (i + 1)));
  }
  return arr;
};

/**
 * Swaps the elements at the given indices in the given array.
 */
export const swap = (arr: any[], i: number, j: number): void => {
  const temp = arr[i];
  arr[i] = arr[j];
  arr[j] = temp;
};

/**
 * Returns an array of numbers from start to end, inclusive.
 */
export const range = (start: number, end: number): number[] => {
  const result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
};

export const validateInteger = (value: number, name: string): void => {
  if (!Number.isInteger(value)) {
    throw new Error(`${name} must be an integer`);
  }
};

export const validateNonNegative = (value: number, name: string): void => {
  if (value < 0) {
    throw new Error(`${name} must be non-negative`);
  }
};

export const validatePositive = (value: number, name: string): void => {
  if (value <= 0) {
    throw new Error(`${name} must be positive`);
  }
};

export const validateNegative = (value: number, name: string): void => {
  if (value >= 0) {
    throw new Error(`${name} must be negative`);
  }
};
