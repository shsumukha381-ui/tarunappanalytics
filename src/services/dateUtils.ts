// src/services/dateUtils.ts

import type { DateRange } from '../types/analytics';

/**
 * Convert a UI-friendly DateRange value (e.g., "7d", "28d", "90d", "365d")
 * into a start and end date string formatted as YYYY-MM-DD, which is the
 * format required by the YouTube Analytics API.
 *
 * The end date is the current date (in UTC) and the start date is calculated
 * by subtracting the appropriate number of days.
 */
export const getDateRangeBounds = (range: DateRange): { startDate: string; endDate: string } => {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

  let days: number;
  switch (range) {
    case '7d':
      days = 7;
      break;
    case '28d':
      days = 28;
      break;
    case '90d':
      days = 90;
      break;
    case '365d':
      days = 365;
      break;
    default:
      days = 28;
  }
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const startDate = start.toISOString().split('T')[0];
  return { startDate, endDate };
};
