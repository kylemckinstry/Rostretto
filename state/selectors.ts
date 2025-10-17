// state/selectors.ts
// Utility selectors to derive filtered views of state

import { getEmployees } from './employees';
import { DayIndicators, Employee } from './types';

export function selectAllEmployees(): Employee[] {
  return getEmployees().sort(
    (a, b) => (b.score ?? 0) - (a.score ?? 0)
  );
}

export function selectAvailableEmployeesForDemand(
  demand: DayIndicators['demand']
): Employee[] {
  const list = getEmployees();
  if (demand === 'Mixed') return list;
  if (demand === 'Coffee') return list.filter((e) => (e.score ?? 0) >= 0.70);
  if (demand === 'Sandwich') return list.filter((e) => (e.score ?? 0) < 0.80);
  return list;
}
