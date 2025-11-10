import { addDays } from '../../utils/date';
import type { DayIndicators } from '../../state/types';

/**
 * Generates mock week indicators for a given week start date
 * @param weekStart - The start of the week (usually from startOfWeek())
 * @returns Record of date keys to day indicators
 */
export function generateMockWeekIndicators(weekStart: Date): Record<string, DayIndicators> {
  const mkKey = (d: Date) => d.toISOString().slice(0, 10);
  
  // Use the week start date to seed different patterns for different weeks
  const weekNumber = Math.floor(weekStart.getTime() / (7 * 24 * 60 * 60 * 1000));
  const seed = weekNumber % 5; // Create 5 different patterns
  
  // Different patterns for variety
  const patterns = [
    // Pattern 0: Coffee-heavy week, some mismatches
    [
      { mismatches: 3, demand: 'Coffee' as const, traffic: 'medium' as const },
      { mismatches: 0, demand: 'Coffee' as const, traffic: 'low' as const },
      { mismatches: 1, demand: 'Sandwich' as const, traffic: 'medium' as const },
      { mismatches: 2, demand: 'Coffee' as const, traffic: 'high' as const },
      { mismatches: 0, demand: 'Coffee' as const, traffic: 'medium' as const },
      { mismatches: 1, demand: 'Coffee' as const, traffic: 'high' as const },
      { mismatches: 0, demand: 'Mixed' as const, traffic: 'low' as const },
    ],
    // Pattern 1: Mixed week, low mismatches
    [
      { mismatches: 0, demand: 'Mixed' as const, traffic: 'low' as const },
      { mismatches: 1, demand: 'Coffee' as const, traffic: 'medium' as const },
      { mismatches: 0, demand: 'Mixed' as const, traffic: 'medium' as const },
      { mismatches: 0, demand: 'Sandwich' as const, traffic: 'low' as const },
      { mismatches: 0, demand: 'Mixed' as const, traffic: 'medium' as const },
      { mismatches: 1, demand: 'Coffee' as const, traffic: 'high' as const },
      { mismatches: 0, demand: 'Mixed' as const, traffic: 'low' as const },
    ],
    // Pattern 2: High traffic week
    [
      { mismatches: 2, demand: 'Coffee' as const, traffic: 'high' as const },
      { mismatches: 3, demand: 'Sandwich' as const, traffic: 'high' as const },
      { mismatches: 1, demand: 'Mixed' as const, traffic: 'medium' as const },
      { mismatches: 4, demand: 'Coffee' as const, traffic: 'high' as const },
      { mismatches: 2, demand: 'Sandwich' as const, traffic: 'high' as const },
      { mismatches: 1, demand: 'Coffee' as const, traffic: 'high' as const },
      { mismatches: 0, demand: 'Mixed' as const, traffic: 'medium' as const },
    ],
    // Pattern 3: Sandwich-heavy week
    [
      { mismatches: 1, demand: 'Sandwich' as const, traffic: 'medium' as const },
      { mismatches: 0, demand: 'Sandwich' as const, traffic: 'low' as const },
      { mismatches: 2, demand: 'Sandwich' as const, traffic: 'medium' as const },
      { mismatches: 1, demand: 'Coffee' as const, traffic: 'high' as const },
      { mismatches: 0, demand: 'Sandwich' as const, traffic: 'medium' as const },
      { mismatches: 0, demand: 'Sandwich' as const, traffic: 'low' as const },
      { mismatches: 1, demand: 'Mixed' as const, traffic: 'low' as const },
    ],
    // Pattern 4: Perfect week (low mismatches, balanced)
    [
      { mismatches: 0, demand: 'Coffee' as const, traffic: 'low' as const },
      { mismatches: 0, demand: 'Coffee' as const, traffic: 'medium' as const },
      { mismatches: 0, demand: 'Sandwich' as const, traffic: 'low' as const },
      { mismatches: 1, demand: 'Mixed' as const, traffic: 'medium' as const },
      { mismatches: 0, demand: 'Coffee' as const, traffic: 'low' as const },
      { mismatches: 0, demand: 'Sandwich' as const, traffic: 'medium' as const },
      { mismatches: 0, demand: 'Mixed' as const, traffic: 'low' as const },
    ],
  ];
  
  const pattern = patterns[seed];
  
  return {
    [mkKey(addDays(weekStart, 0))]: pattern[0],
    [mkKey(addDays(weekStart, 1))]: pattern[1],
    [mkKey(addDays(weekStart, 2))]: pattern[2],
    [mkKey(addDays(weekStart, 3))]: pattern[3],
    [mkKey(addDays(weekStart, 4))]: pattern[4],
    [mkKey(addDays(weekStart, 5))]: pattern[5],
    [mkKey(addDays(weekStart, 6))]: pattern[6],
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
