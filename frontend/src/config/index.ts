// API Configuration
export const API_BASE_URL = 'http://192.168.99.100:3000/api';

// Default request timeout in milliseconds
export const API_TIMEOUT = 10000;

// Default pagination settings
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Cache settings
export const CACHE_STALE_TIME = 5 * 60 * 1000; // 5 minutes

// Local storage keys
export const LOCAL_STORAGE_KEYS = {
  THEME: 'theme',
  AUTH: 'auth',
  REDIRECT_PATH: 'redirectPath',
} as const;

// Routes
// Add any route constants here if needed
