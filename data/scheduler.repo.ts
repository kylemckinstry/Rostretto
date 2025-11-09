// data/scheduler.repo.ts
import { api, type EmployeeLite, type ShiftDTO, type AssignmentDTO, type ConfigResponse, type IndicatorsResponse } from '../api/client';

export type WeekBundle = {
  week: string;
  employees: EmployeeLite[];
  shifts: ShiftDTO[];
  assignments: AssignmentDTO[];
  config: ConfigResponse;
  indicators: IndicatorsResponse;
};

export async function fetchWeekBundle(week: string): Promise<WeekBundle> {
  const [employees, shifts, assignments, config, indicators] = await Promise.all([
    api.employees(),
    api.shifts(week),
    api.assignments(week),
    api.config(),
    api.indicators(week),
  ]);
  return { week, employees, shifts, assignments, config, indicators };
}
