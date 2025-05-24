// User related types
export type UserRole = 'STUDENT' | 'ADMIN' | 'LIBRARIAN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Book related types
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  publicationYear?: number;
  description?: string;
  coverImage?: string;
  totalCopies: number;
  availableCopies: number;
  location?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

// Room related types
export interface Room {
  id: string;
  name: string;
  description?: string;
  capacity: number;
  floor: number;
  building: string;
  hasProjector: boolean;
  hasWhiteboard: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Seat related types
export interface Seat {
  id: string;
  roomId: string;
  label: string;
  description?: string;
  isActive: boolean;
  room: Pick<Room, 'id' | 'name' | 'building' | 'floor'>;
  createdAt: string;
  updatedAt: string;
}

// Reservation related types
export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

export interface Reservation {
  id: string;
  userId: string;
  resourceId: string;
  resourceType: 'BOOK' | 'ROOM' | 'SEAT';
  startTime: string;
  endTime: string;
  status: ReservationStatus;
  notes?: string;
  user: Pick<User, 'id' | 'name' | 'email'>;
  resource: Book | Room | Seat;
  createdAt: string;
  updatedAt: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

// API response type
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// Form related types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'select' | 'textarea' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { label: string; value: string | number }[];
  validation?: {
    required?: string | boolean;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    validate?: (value: any) => string | boolean;
  };
}

// Search and filter types
export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}
