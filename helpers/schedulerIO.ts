// -----------------------------------------------------------------------------
// helpers/schedulerIO.ts
// Serialize your in-app data to the research-project scheduler format
// -----------------------------------------------------------------------------

import { EmployeesState } from '../state/employees';
import { toSchedulerAssignment } from './roleMappers';
import { SchedulerRole } from '../state/types';

export function serializeSchedule(state: EmployeesState) {
  const employees = Object.values(state.employees).map((e) => ({
    id: e.id,
    name: e.name,
  }));

  const assignments = Object.values(state.assignments)
    .flat()
    .map(toSchedulerAssignment);

  return { employees, assignments };
}

// Convert daily demand indicators into default_requirements blocks
export function roleCoverageFromIndicators(indicators: Record<string, {
  demand: 'Coffee' | 'Sandwich' | 'Mixed';
}>) {
  const out: Record<string, Record<SchedulerRole, number>> = {};

  for (const [dateISO, { demand }] of Object.entries(indicators)) {
    const coverage: Record<SchedulerRole, number> = {
      MANAGER: 1,
      BARISTA: 0,
      WAITER: 0,
      SANDWICH: 0,
    };

    if (demand === 'Coffee') coverage.BARISTA = 2;
    else if (demand === 'Sandwich') coverage.SANDWICH = 2;
    else {
      coverage.BARISTA = 1;
      coverage.SANDWICH = 1;
      coverage.WAITER = 1;
    }

    out[dateISO] = coverage;
  }

  return out;
}
