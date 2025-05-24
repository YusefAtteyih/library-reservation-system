import { format, formatDistanceToNow, parseISO, isBefore, isAfter, addDays, addHours, addMinutes, differenceInMinutes, differenceInDays, isSameDay } from 'date-fns';
import { DATE_FORMAT, TIME_FORMAT, DATE_TIME_FORMAT } from '@/constants';

/**
 * Format a date string to a human-readable format
 * @param dateString - ISO date string
 * @param formatString - Optional format string (defaults to 'MMM d, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | Date, formatString: string = DATE_FORMAT): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a time string to a human-readable format
 * @param dateString - ISO date string
 * @param formatString - Optional format string (defaults to 'h:mm a')
 * @returns Formatted time string
 */
export const formatTime = (dateString: string | Date, formatString: string = TIME_FORMAT): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid time';
  }
};

/**
 * Format a date and time string to a human-readable format
 * @param dateString - ISO date string
 * @param formatString - Optional format string (defaults to 'MMM d, yyyy \'at\' h:mm a')
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string | Date, formatString: string = DATE_TIME_FORMAT): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatString);
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return 'Invalid date and time';
  }
};

/**
 * Get a relative time string (e.g., "2 hours ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string | Date): string => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error getting relative time:', error);
    return 'some time ago';
  }
};

/**
 * Check if a date is in the past
 * @param dateString - ISO date string
 * @returns boolean
 */
export const isPast = (dateString: string | Date): boolean => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isBefore(date, new Date());
  } catch (error) {
    console.error('Error checking if date is in the past:', error);
    return false;
  }
};

/**
 * Check if a date is in the future
 * @param dateString - ISO date string
 * @returns boolean
 */
export const isFuture = (dateString: string | Date): boolean => {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isAfter(date, new Date());
  } catch (error) {
    console.error('Error checking if date is in the future:', error);
    return false;
  }
};

/**
 * Add days to a date
 * @param dateString - ISO date string or Date object
 * @param days - Number of days to add (can be negative)
 * @returns New Date object
 */
export const addDaysToDate = (dateString: string | Date, days: number): Date => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return addDays(date, days);
};

/**
 * Add hours to a date
 * @param dateString - ISO date string or Date object
 * @param hours - Number of hours to add (can be negative)
 * @returns New Date object
 */
export const addHoursToDate = (dateString: string | Date, hours: number): Date => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return addHours(date, hours);
};

/**
 * Add minutes to a date
 * @param dateString - ISO date string or Date object
 * @param minutes - Number of minutes to add (can be negative)
 * @returns New Date object
 */
export const addMinutesToDate = (dateString: string | Date, minutes: number): Date => {
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  return addMinutes(date, minutes);
};

/**
 * Get the difference in minutes between two dates
 * @param startDate - Start date string or Date object
 * @param endDate - End date string or Date object
 * @returns Number of minutes between the two dates
 */
export const getMinutesDifference = (startDate: string | Date, endDate: string | Date): number => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return differenceInMinutes(end, start);
};

/**
 * Get the difference in days between two dates
 * @param startDate - Start date string or Date object
 * @param endDate - End date string or Date object
 * @returns Number of days between the two dates
 */
export const getDaysDifference = (startDate: string | Date, endDate: string | Date): number => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  return differenceInDays(end, start);
};

/**
 * Check if two dates are the same day
 * @param date1 - First date string or Date object
 * @param date2 - Second date string or Date object
 * @returns boolean
 */
export const isSameDate = (date1: string | Date, date2: string | Date): boolean => {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(d1, d2);
};

/**
 * Format a duration in minutes to a human-readable format (e.g., "2h 30m")
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 1) return 'Less than a minute';
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) return `${minutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Get an array of time slots between two dates
 * @param startDate - Start date string or Date object
 * @param endDate - End date string or Date object
 * @param intervalMinutes - Interval in minutes (default: 30)
 * @returns Array of Date objects
 */
export const getTimeSlots = (
  startDate: string | Date,
  endDate: string | Date,
  intervalMinutes: number = 30
): Date[] => {
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  const slots: Date[] = [];
  let current = new Date(start);
  
  while (current <= end) {
    slots.push(new Date(current));
    current = addMinutes(current, intervalMinutes);
  }
  
  return slots;
};
