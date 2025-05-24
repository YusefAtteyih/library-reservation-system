import { LOCAL_STORAGE_KEYS } from '@/constants';

/**
 * Safely get an item from localStorage
 * @param key - Storage key
 * @param defaultValue - Default value if item doesn't exist
 * @returns The stored value or defaultValue
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item from localStorage: ${error}`);
    return defaultValue;
  }
};

/**
 * Safely set an item in localStorage
 * @param key - Storage key
 * @param value - Value to store
 */
export const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item in localStorage: ${error}`);
  }
};

/**
 * Safely remove an item from localStorage
 * @param key - Storage key to remove
 */
export const removeStorageItem = (key: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from localStorage: ${error}`);
  }
};

/**
 * Clear all items from localStorage
 */
export const clearStorage = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.clear();
  } catch (error) {
    console.error(`Error clearing localStorage: ${error}`);
  }
};

/**
 * Get the current user from localStorage
 * @returns The current user or null if not found
 */
export const getCurrentUser = (): any => {
  return getStorageItem(LOCAL_STORAGE_KEYS.USER, null);
};

/**
 * Set the current user in localStorage
 * @param user - User object to store
 */
export const setCurrentUser = (user: any): void => {
  setStorageItem(LOCAL_STORAGE_KEYS.USER, user);
};

/**
 * Remove the current user from localStorage
 */
export const removeCurrentUser = (): void => {
  removeStorageItem(LOCAL_STORAGE_KEYS.USER);
};

/**
 * Get an item from sessionStorage
 * @param key - Storage key
 * @param defaultValue - Default value if item doesn't exist
 * @returns The stored value or defaultValue
 */
export const getSessionItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error getting item from sessionStorage: ${error}`);
    return defaultValue;
  }
};

/**
 * Set an item in sessionStorage
 * @param key - Storage key
 * @param value - Value to store
 */
export const setSessionItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting item in sessionStorage: ${error}`);
  }
};

/**
 * Remove an item from sessionStorage
 * @param key - Storage key to remove
 */
export const removeSessionItem = (key: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing item from sessionStorage: ${error}`);
  }
};

/**
 * Clear all items from sessionStorage
 */
export const clearSession = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.clear();
  } catch (error) {
    console.error(`Error clearing sessionStorage: ${error}`);
  }
};

/**
 * Get a cookie by name
 * @param name - Cookie name
 * @returns Cookie value or null if not found
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const part = parts.pop();
    return part ? part.split(';').shift() || null : null;
  }
  
  return null;
};

/**
 * Set a cookie
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Expiration in days (default: 30)
 */
export const setCookie = (name: string, value: string, days: number = 30): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
};

/**
 * Delete a cookie
 * @param name - Cookie name to delete
 */
export const deleteCookie = (name: string): void => {
  if (typeof document === 'undefined') {
    return;
  }
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
};

/**
 * Clear all cookies
 */
export const clearAllCookies = (): void => {
  if (typeof document === 'undefined') {
    return;
  }
  
  const cookies = document.cookie.split(';');
  
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
  }
};
