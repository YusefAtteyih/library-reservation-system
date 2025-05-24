/**
 * Capitalize the first letter of a string
 * @param str - Input string
 * @returns String with first letter capitalized
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert a string to title case
 * @param str - Input string
 * @returns String in title case
 */
export const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Convert a string to kebab-case
 * @param str - Input string
 * @returns String in kebab-case
 */
export const toKebabCase = (str: string): string => {
  if (!str) return '';
  return str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    ?.map((x) => x.toLowerCase())
    .join('-') || '';
};

/**
 * Convert a string to camelCase
 * @param str - Input string
 * @returns String in camelCase
 */
export const toCamelCase = (str: string): string => {
  if (!str) return '';
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
};

/**
 * Convert a string to PascalCase
 * @param str - Input string
 * @returns String in PascalCase
 */
export const toPascalCase = (str: string): string => {
  if (!str) return '';
  return (` ${str}`)
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
};

/**
 * Truncate a string to a specified length
 * @param str - Input string
 * @param length - Maximum length
 * @param ellipsis - Whether to add '...' at the end (default: true)
 * @returns Truncated string
 */
export const truncate = (str: string, length: number, ellipsis: boolean = true): string => {
  if (!str) return '';
  if (str.length <= length) return str;
  return ellipsis ? `${str.slice(0, length)}...` : str.slice(0, length);
};

/**
 * Generate a random string of specified length
 * @param length - Length of the random string (default: 10)
 * @returns Random string
 */
export const generateRandomString = (length: number = 10): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
};

/**
 * Check if a string is a valid email address
 * @param email - Email address to validate
 * @returns boolean
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Check if a string is a valid URL
 * @param url - URL to validate
 * @returns boolean
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Remove HTML tags from a string
 * @param str - Input string with HTML
 * @returns String with HTML tags removed
 */
export const stripHtml = (str: string): string => {
  if (!str) return '';
  return str.replace(/<[^>]*>?/gm, '');
};

/**
 * Convert newlines to <br> tags
 * @param str - Input string
 * @returns String with newlines converted to <br> tags
 */
export const nl2br = (str: string): string => {
  if (!str) return '';
  return str.replace(/\n/g, '<br>');
};

/**
 * Convert a string to a URL-friendly slug
 * @param str - Input string
 * @returns URL-friendly slug
 */
export const slugify = (str: string): string => {
  if (!str) return '';
  
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

/**
 * Mask sensitive information in a string (e.g., email, phone number)
 * @param str - Input string
 * @param type - Type of masking ('email' | 'phone' | 'ssn' | 'creditcard')
 * @returns Masked string
 */
export const maskSensitiveInfo = (str: string, type: 'email' | 'phone' | 'ssn' | 'creditcard' = 'email'): string => {
  if (!str) return '';
  
  switch (type) {
    case 'email':
      const [username, domain] = str.split('@');
      if (!username || !domain) return str;
      const maskedUsername = username.length > 2 
        ? username[0] + '*'.repeat(3) + username.slice(-1)
        : '*'.repeat(username.length);
      return `${maskedUsername}@${domain}`;
      
    case 'phone':
      const digits = str.replace(/\D/g, '');
      if (digits.length < 4) return str;
      const lastFour = digits.slice(-4);
      return `***-***-${lastFour}`;
      
    case 'ssn':
      const ssnDigits = str.replace(/\D/g, '');
      if (ssnDigits.length !== 9) return str;
      return `***-**-${ssnDigits.slice(-4)}`;
      
    case 'creditcard':
      const ccDigits = str.replace(/\D/g, '');
      if (ccDigits.length < 4) return str;
      return `****-****-****-${ccDigits.slice(-4)}`;
      
    default:
      return str;
  }
};

/**
 * Count the number of words in a string
 * @param str - Input string
 * @returns Number of words
 */
export const countWords = (str: string): number => {
  if (!str) return 0;
  return str.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Count the number of characters in a string (excluding spaces)
 * @param str - Input string
 * @returns Number of characters (excluding spaces)
 */
export const countCharacters = (str: string): number => {
  if (!str) return 0;
  return str.replace(/\s/g, '').length;
};

/**
 * Generate initials from a name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 */
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  const names = name.trim().split(/\s+/);
  if (names.length === 1) return names[0].charAt(0).toUpperCase();
  
  return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
};

/**
 * Generate a hash code from a string
 * @param str - Input string
 * @returns Hash code
 */
export const hashCode = (str: string): number => {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return hash;
};

/**
 * Check if a string contains only letters and numbers
 * @param str - Input string
 * @returns boolean
 */
export const isAlphaNumeric = (str: string): boolean => {
  return /^[a-z0-9]+$/i.test(str);
};

/**
 * Check if a string is a valid hexadecimal color code
 * @param str - Input string
 * @returns boolean
 */
export const isHexColor = (str: string): boolean => {
  return /^#([0-9A-F]{3}){1,2}$/i.test(str);
};

/**
 * Convert a string to a boolean
 * @param str - Input string
 * @returns boolean
 */
export const toBoolean = (str: string | boolean | number | null | undefined): boolean => {
  if (typeof str === 'boolean') return str;
  if (typeof str === 'number') return str !== 0;
  if (!str) return false;
  
  const s = str.toString().toLowerCase().trim();
  return s === 'true' || s === '1' || s === 'yes' || s === 'y';
};
