// -----------------------------------------------------------------------------
// state/selectors.ts
// Utility selectors to derive filtered views of state
// -----------------------------------------------------------------------------

import { EmployeesState } from './employees';
import { DayIndicators, Employee } from './types';

export function selectAllEmployees(state: EmployeesState): Employee[] {
  return Object.values(state.employees).sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0)
  );
}

export function selectAssignmentsForDate(
  state: EmployeesState,
  dateISO: string
) {
  return state.assignments[dateISO] ?? [];
}

export function selectAvailableEmployeesForDemand(
  state: EmployeesState,
  demand: DayIndicators['demand']
): Employee[] {
  const list = Object.values(state.employees);
  if (demand === 'Mixed') return list;
  if (demand === 'Coffee') return list.filter((e) => e.score! >= 70);
  if (demand === 'Sandwich') return list.filter((e) => e.score! < 80);
  return list;
}
