// state/selectors.ts
import { DayIndicators, Employee } from './types';

// --- Employee Selectors ---

/** Returns all employees sorted by descending score */
export function selectAllEmployees(list: Employee[]): Employee[] {
  return [...list].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}

/** Returns predicate function to filter employees by demand type */
export function selectAvailableEmployeesForDemand(
  demand: DayIndicators['demand']
): (list: Employee[]) => Employee[] {
  return (list: Employee[]) => {
    if (demand === 'Mixed') return list;
    if (demand === 'Coffee') return list.filter((e) => (e.score ?? 0) >= 0.7);
    if (demand === 'Sandwich') return list.filter((e) => (e.score ?? 0) < 0.8);
    return list;
  };
}

