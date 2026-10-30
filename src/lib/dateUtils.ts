/**
 * Date and time utility helpers
 * Safe Date manipulation without invalid string concatenations
 */

export const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

/**
 * Format a Date object to YYYY-MM-DD
 */
export function formatDateToISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date object to HH:mm:ss for Supabase TIME columns
 */
export function formatTimeToISO(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format time for display, e.g. "9:30 AM"
 */
export function formatTimeDisplay(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format human-readable date, e.g. "Wednesday, Nov 4, 2026"
 */
export function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format date string (YYYY-MM-DD) to friendly format
 */
export function formatISOStringDisplay(dateStr: string): string {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
  const d = new Date(year, month, day);
  return formatDateDisplay(d);
}

/**
 * Safely parse a time string like "08:30:00" or "08:30" or "8:30"
 * into { hours: number, minutes: number, seconds: number }
 */
export function parseTimeString(timeStr: string): { hours: number; minutes: number; seconds: number } {
  if (!timeStr) return { hours: 0, minutes: 0, seconds: 0 };
  const parts = timeStr.trim().split(':');
  const hours = parseInt(parts[0] || '0', 10);
  const minutes = parseInt(parts[1] || '0', 10);
  const seconds = parseInt(parts[2] || '0', 10);
  return {
    hours: isNaN(hours) ? 0 : hours,
    minutes: isNaN(minutes) ? 0 : minutes,
    seconds: isNaN(seconds) ? 0 : seconds,
  };
}

/**
 * Combine a date object (or YYYY-MM-DD string) with a time string (HH:mm[:ss])
 * into a single real Date object.
 */
export function combineDateAndTime(dateInput: Date | string, timeStr: string): Date {
  let year: number;
  let month: number;
  let day: number;

  if (typeof dateInput === 'string') {
    const [y, m, d] = dateInput.split('-').map(Number);
    year = y;
    month = m - 1;
    day = d;
  } else {
    year = dateInput.getFullYear();
    month = dateInput.getMonth();
    day = dateInput.getDate();
  }

  const { hours, minutes, seconds } = parseTimeString(timeStr);
  return new Date(year, month, day, hours, minutes, seconds, 0);
}

/**
 * Add minutes to a Date object, returning a new Date object
 */
export function addMinutesToDate(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}
