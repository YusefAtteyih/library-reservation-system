/**
 * Format a number with commas as thousands separators
 * @param num - Number to format
 * @returns Formatted string
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

/**
 * Format a number as currency
 * @param num - Number to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  num: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(num);
};

/**
 * Format a number as a percentage
 * @param num - Number to format (0-1 for 0-100%)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 */
export const formatPercent = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat(undefined, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Generate a random number between min and max (inclusive)
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random number between min and max
 */
export const randomInRange = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Clamp a number between a minimum and maximum value
 * @param num - Number to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped number
 */
export const clamp = (num: number, min: number, max: number): number => {
  return Math.min(Math.max(num, min), max);
};

/**
 * Round a number to a specified number of decimal places
 * @param num - Number to round
 * @param decimals - Number of decimal places (default: 0)
 * @returns Rounded number
 */
export const round = (num: number, decimals: number = 0): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

/**
 * Calculate the sum of an array of numbers
 * @param arr - Array of numbers
 * @returns Sum of the numbers
 */
export const sum = (arr: number[]): number => {
  return arr.reduce((acc, val) => acc + val, 0);
};

/**
 * Calculate the average of an array of numbers
 * @param arr - Array of numbers
 * @returns Average of the numbers
 */
export const average = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  return sum(arr) / arr.length;
};

/**
 * Calculate the median of an array of numbers
 * @param arr - Array of numbers
 * @returns Median of the numbers
 */
export const median = (arr: number[]): number => {
  if (arr.length === 0) return 0;
  
  const sorted = [...arr].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  
  return sorted[middle];
};

/**
 * Calculate the mode of an array of numbers
 * @param arr - Array of numbers
 * @returns Mode of the numbers (array of most frequent values)
 */
export const mode = (arr: number[]): number[] => {
  if (arr.length === 0) return [];
  
  const frequencyMap = arr.reduce<Record<number, number>>((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  
  const frequencies = Object.values(frequencyMap);
  if (frequencies.length === 0) return [];
  
  const maxFrequency = Math.max(...frequencies);
  
  return Object.entries(frequencyMap)
    .filter(([_, freq]) => freq === maxFrequency)
    .map(([val]) => Number(val));
};

/**
 * Calculate the standard deviation of an array of numbers
 * @param arr - Array of numbers
 * @param usePopulation - Whether to calculate population standard deviation (default: false for sample)
 * @returns Standard deviation
 */
export const standardDeviation = (arr: number[], usePopulation: boolean = false): number => {
  if (arr.length === 0) return 0;
  
  const avg = average(arr);
  const squareDiffs = arr.map(val => Math.pow(val - avg, 2));
  const variance = sum(squareDiffs) / (usePopulation ? arr.length : arr.length - 1);
  
  return Math.sqrt(variance);
};

/**
 * Generate a sequence of numbers
 * @param start - Start value
 * @param end - End value (inclusive)
 * @param step - Step between numbers (default: 1)
 * @returns Array of numbers
 */
export const range = (start: number, end: number, step: number = 1): number[] => {
  const result: number[] = [];
  
  if (step === 0) {
    throw new Error('Step cannot be zero');
  }
  
  if (start < end && step < 0) {
    throw new Error('Step must be positive when start < end');
  }
  
  if (start > end && step > 0) {
    throw new Error('Step must be negative when start > end');
  }
  
  if (step > 0) {
    for (let i = start; i <= end; i += step) {
      result.push(i);
    }
  } else {
    for (let i = start; i >= end; i += step) {
      result.push(i);
    }
  }
  
  return result;
};

/**
 * Check if a number is prime
 * @param num - Number to check
 * @returns boolean indicating if the number is prime
 */
export const isPrime = (num: number): boolean => {
  if (num <= 1) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  
  const sqrt = Math.sqrt(num);
  for (let i = 3; i <= sqrt; i += 2) {
    if (num % i === 0) return false;
  }
  
  return true;
};

/**
 * Get all prime factors of a number
 * @param num - Number to factorize
 * @returns Array of prime factors
 */
export const getPrimeFactors = (num: number): number[] => {
  if (num < 2) return [];
  
  const factors: number[] = [];
  let divisor = 2;
  
  while (num >= 2) {
    if (num % divisor === 0) {
      factors.push(divisor);
      num = num / divisor;
    } else {
      divisor++;
    }
  }
  
  return factors;
};

/**
 * Calculate the greatest common divisor (GCD) of two numbers
 * @param a - First number
 * @param b - Second number
 * @returns GCD of a and b
 */
export const gcd = (a: number, b: number): number => {
  if (b === 0) return Math.abs(a);
  return gcd(b, a % b);
};

/**
 * Calculate the least common multiple (LCM) of two numbers
 * @param a - First number
 * @param b - Second number
 * @returns LCM of a and b
 */
export const lcm = (a: number, b: number): number => {
  return Math.abs(a * b) / gcd(a, b);
};

/**
 * Convert a number to a different base
 * @param num - Number to convert
 * @param base - Target base (2-36)
 * @returns String representation of the number in the target base
 */
export const toBase = (num: number, base: number): string => {
  if (base < 2 || base > 36) {
    throw new Error('Base must be between 2 and 36');
  }
  
  return num.toString(base);
};

/**
 * Convert a number from a different base to decimal
 * @param str - String representation of the number
 * @param base - Source base (2-36)
 * @returns Decimal number
 */
export const fromBase = (str: string, base: number): number => {
  if (base < 2 || base > 36) {
    throw new Error('Base must be between 2 and 36');
  }
  
  return parseInt(str, base);
};

/**
 * Generate a random hexadecimal color code
 * @returns Hex color code (e.g., '#1a2b3c')
 */
export const randomHexColor = (): string => {
  return `#${Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0')}`;
};

/**
 * Convert a number to a Roman numeral
 * @param num - Number to convert (1-3999)
 * @returns Roman numeral string
 */
export const toRoman = (num: number): string => {
  if (num < 1 || num > 3999) {
    throw new Error('Number must be between 1 and 3999');
  }
  
  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const numerals = [
    'M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'
  ];
  
  let result = '';
  
  for (let i = 0; i < values.length; i++) {
    while (num >= values[i]) {
      result += numerals[i];
      num -= values[i];
    }
  }
  
  return result;
};

/**
 * Convert a Roman numeral to a number
 * @param str - Roman numeral string
 * @returns Number value
 */
export const fromRoman = (str: string): number => {
  const romanValues: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000
  };
  
  let result = 0;
  let prev = 0;
  
  for (let i = str.length - 1; i >= 0; i--) {
    const current = romanValues[str[i]];
    
    if (current >= prev) {
      result += current;
    } else {
      result -= current;
    }
    
    prev = current;
  }
  
  return result;
};

/**
 * Format a number with a given number of significant digits
 * @param num - Number to format
 * @param digits - Number of significant digits (default: 3)
 * @returns Formatted string
 */
export const toSignificantDigits = (num: number, digits: number = 3): string => {
  return num.toPrecision(digits);
};

/**
 * Check if a number is within a specified range
 * @param num - Number to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns boolean indicating if the number is in range
 */
export const isInRange = (num: number, min: number, max: number): boolean => {
  return num >= min && num <= max;
};

/**
 * Calculate the percentage of a value relative to a total
 * @param value - Value to calculate percentage for
 * @param total - Total value (100%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Percentage value
 */
export const calculatePercentage = (
  value: number,
  total: number,
  decimals: number = 2
): number => {
  if (total === 0) return 0;
  const percentage = (value / total) * 100;
  return round(percentage, decimals);
};

/**
 * Calculate the value that corresponds to a percentage of a total
 * @param percentage - Percentage value (0-100)
 * @param total - Total value (100%)
 * @returns Calculated value
 */
export const percentageOf = (percentage: number, total: number): number => {
  return (total * percentage) / 100;
};

/**
 * Convert a number to a human-readable file size string
 * @param bytes - File size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size string (e.g., '1.23 MB')
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Calculate the factorial of a number
 * @param n - Input number
 * @returns Factorial of n
 */
export const factorial = (n: number): number => {
  if (n < 0) {
    throw new Error('Factorial is not defined for negative numbers');
  }
  
  if (n === 0 || n === 1) return 1;
  
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  
  return result;
};

/**
 * Calculate the Fibonacci number at a given position
 * @param n - Position in the Fibonacci sequence (0-based)
 * @returns Fibonacci number at position n
 */
export const fibonacci = (n: number): number => {
  if (n < 0) {
    throw new Error('Fibonacci is not defined for negative numbers');
  }
  
  if (n <= 1) return n;
  
  let a = 0;
  let b = 1;
  
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  
  return b;
};

/**
 * Check if a number is a power of two
 * @param num - Number to check
 * @returns boolean indicating if the number is a power of two
 */
export const isPowerOfTwo = (num: number): boolean => {
  if (num < 1) return false;
  return (num & (num - 1)) === 0;
};

/**
 * Calculate the nth root of a number
 * @param num - Number to calculate the root of
 * @param n - Root degree (e.g., 2 for square root, 3 for cube root)
 * @returns The nth root of the number
 */
export const nthRoot = (num: number, n: number = 2): number => {
  if (n === 0) {
    throw new Error('Root degree cannot be zero');
  }
  
  if (num < 0 && n % 2 === 0) {
    throw new Error('Even root of a negative number is not a real number');
  }
  
  return Math.sign(num) * Math.pow(Math.abs(num), 1 / n);
};
