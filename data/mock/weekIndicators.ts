import { addDays } from '../../utils/date';
import type { DayIndicators } from '../../state/types';

/**
 * Generates mock week indicators for a given week start date
 * @param weekStart - The start of the week (usually from startOfWeek())
 * @returns Record of date keys to day indicators
 */
export function generateMockWeekIndicators(weekStart: Date): Record<string, DayIndicators> {
  const mkKey = (d: Date) => d.toISOString().slice(0, 10);
  
  return {
    [mkKey(addDays(weekStart, 0))]: { mismatches: 3, demand: 'Coffee', traffic: 'medium' },
    [mkKey(addDays(weekStart, 1))]: { mismatches: 0, demand: 'Mixed', traffic: 'low' },
    [mkKey(addDays(weekStart, 2))]: { mismatches: 1, demand: 'Sandwich', traffic: 'medium' },
    [mkKey(addDays(weekStart, 3))]: { mismatches: 2, demand: 'Coffee', traffic: 'high' },
    [mkKey(addDays(weekStart, 4))]: { mismatches: 0, demand: 'Mixed', traffic: 'medium' },
    [mkKey(addDays(weekStart, 5))]: { mismatches: 1, demand: 'Coffee', traffic: 'high' },
    [mkKey(addDays(weekStart, 6))]: { mismatches: 0, demand: 'Mixed', traffic: 'low' },
  };
}

/**
 * Default indicators used when no specific date data is available
 */
export const DEFAULT_DAY_INDICATORS: DayIndicators = {
  mismatches: 0,
  demand: 'Mixed',
  traffic: 'medium',
};
