// helpers/schedulerIO.ts
import { getEmployeesUI } from '../viewmodels/employees';
import { toSchedulerAssignment } from './roleMappers';
import { SchedulerRole } from '../state/types';

// Scheduler Data Serialisation

// Convert employee data to scheduler format
export function serializeSchedule() {
  const employees = getEmployeesUI().map((e) => ({
    id: e.id,
    name: e.name,
  }));

  // Assignment serialisation pending scheduling logic implementation
  const assignments: any[] = [];

  return { employees, assignments };
}

// Convert demand indicators to scheduler coverage requirements
export function roleCoverageFromIndicators(
  indicators: Record<
    string,
    {
      demand: 'Coffee' | 'Sandwich' | 'Mixed';
    }
  >
) {
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
