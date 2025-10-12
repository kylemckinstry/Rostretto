// -----------------------------------------------------------------------------
// helpers/roleMappers.ts
// Role conversions and shift translation helpers
// -----------------------------------------------------------------------------

import {
  DayIndicators,
  Role,
  SchedulerRole,
  UI_TO_SCHEDULER_ROLE,
  ShiftEvent,
} from '../state/types';

export function demandToSchedulerRoles(
  demand: DayIndicators['demand']
): SchedulerRole[] {
  switch (demand) {
    case 'Coffee':
      return ['BARISTA'];
    case 'Sandwich':
      return ['SANDWICH'];
    default:
      return ['BARISTA', 'SANDWICH', 'WAITER'];
  }
}

export function toSchedulerAssignment(e: ShiftEvent) {
  const roleKey: SchedulerRole =
    e.role === 'Closer'
      ? 'BARISTA'
      : UI_TO_SCHEDULER_ROLE[e.role as Exclude<Role, 'Closer'>];

  const startISO = e.startISO ?? e.start.toISOString();
  const endISO = e.endISO ?? e.end.toISOString();

  return {
    employee_id: e.employeeId,
    role: roleKey,
    start: startISO,
    end: endISO,
    tags: e.tags ?? [],
  };
}
