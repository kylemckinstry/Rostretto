// api/adapters.ts
import { employeeDtoSchema, type EmployeeDTO } from '../models/schemas';
import { normaliseEmployee } from '../models/normalisers';

// Backend role strings: 'BARISTA' | 'SANDWICH' | 'MANAGER' | 'WAITER'
export type SchedulerRole = 'BARISTA' | 'SANDWICH' | 'MANAGER' | 'WAITER';

export function parseEmployeesDTO(raw: unknown): EmployeeDTO[] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((x) => employeeDtoSchema.parse(x));
}

export function dtoToUiEmployee(d: EmployeeDTO) {
  return normaliseEmployee({
    id: String(d.employeeId),
    first_name: d.firstName,
    last_name: d.lastName,
    primary_role: d.roles[0] as SchedulerRole, // keep simple; expand later if needed
    // Skills mapping available: d.skills // { BARISTA: 0.8, ... }
  });
}
