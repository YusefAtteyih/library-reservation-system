// Application constants
export const APP_NAME = 'Library Reservation System';
export const APP_DESCRIPTION = 'A modern library management system for reserving books, rooms, and study spaces.';

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  REDIRECT_URL: 'redirectUrl',
};

// Date and time formats
export const DATE_FORMAT = 'MMM d, yyyy';
export const TIME_FORMAT = 'h:mm a';
export const DATE_TIME_FORMAT = `${DATE_FORMAT} 'at' ${TIME_FORMAT}`;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

// Roles and permissions
export const ROLES = {
  ADMIN: 'ADMIN',
  LIBRARIAN: 'LIBRARIAN',
  STUDENT: 'STUDENT',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.LIBRARIAN]: 'Librarian',
  [ROLES.STUDENT]: 'Student',
};

// Reservation statuses
export const RESERVATION_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW',
} as const;

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  [RESERVATION_STATUSES.PENDING]: 'Pending',
  [RESERVATION_STATUSES.CONFIRMED]: 'Confirmed',
  [RESERVATION_STATUSES.CANCELLED]: 'Cancelled',
  [RESERVATION_STATUSES.COMPLETED]: 'Completed',
  [RESERVATION_STATUSES.NO_SHOW]: 'No Show',
};

export const RESERVATION_STATUS_COLORS: Record<string, string> = {
  [RESERVATION_STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800',
  [RESERVATION_STATUSES.CONFIRMED]: 'bg-blue-100 text-blue-800',
  [RESERVATION_STATUSES.CANCELLED]: 'bg-red-100 text-red-800',
  [RESERVATION_STATUSES.COMPLETED]: 'bg-green-100 text-green-800',
  [RESERVATION_STATUSES.NO_SHOW]: 'bg-gray-100 text-gray-800',
};

// Resource types
export const RESOURCE_TYPES = {
  BOOK: 'BOOK',
  ROOM: 'ROOM',
  SEAT: 'SEAT',
} as const;

export const RESOURCE_TYPE_LABELS: Record<string, string> = {
  [RESOURCE_TYPES.BOOK]: 'Book',
  [RESOURCE_TYPES.ROOM]: 'Room',
  [RESOURCE_TYPES.SEAT]: 'Seat',
};

// Navigation
export const NAV_ITEMS = [
  { name: 'Home', path: '/', icon: 'home' },
  { name: 'Books', path: '/books', icon: 'book' },
  { name: 'Rooms', path: '/rooms', icon: 'building' },
  { name: 'Reservations', path: '/reservations', icon: 'calendar' },
];

export const ADMIN_NAV_ITEMS = [
  { name: 'Dashboard', path: '/admin', icon: 'layout-dashboard' },
  { name: 'Users', path: '/admin/users', icon: 'users' },
  { name: 'Books', path: '/admin/books', icon: 'book' },
  { name: 'Rooms', path: '/admin/rooms', icon: 'building' },
  { name: 'Reservations', path: '/admin/reservations', icon: 'calendar' },
  { name: 'Reports', path: '/admin/reports', icon: 'bar-chart' },
];

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  MIN_LENGTH: (length: number) => `Must be at least ${length} characters`,
  MAX_LENGTH: (length: number) => `Must be at most ${length} characters`,
  PASSWORD_MISMATCH: 'Passwords do not match',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_TIME: 'Please enter a valid time',
};

// API error codes
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  RATE_LIMIT_EXCEEED: 'RATE_LIMIT_EXCEEDED',
} as const;

// Cache keys
export const CACHE_KEYS = {
  CURRENT_USER: 'current-user',
  BOOKS: 'books',
  ROOMS: 'rooms',
  SEATS: 'seats',
  RESERVATIONS: 'reservations',
  USERS: 'users',
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_REGISTRATION: true,
  ENABLE_GOOGLE_AUTH: false,
  ENABLE_FACEBOOK_AUTH: false,
  ENABLE_TWITTER_AUTH: false,
  ENABLE_GITHUB_AUTH: false,
  ENABLE_EMAIL_VERIFICATION: false,
  ENABLE_TWO_FACTOR_AUTH: false,
} as const;
