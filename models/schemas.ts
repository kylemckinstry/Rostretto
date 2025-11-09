import { z } from 'zod';

export const employeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  roles: z.array(z.string()).default([]),
  availability: z.record(z.string(), z.any()).optional(),
  metrics: z.object({
    score: z.number().min(0).max(100).optional(),
  }).optional(),
  flags: z.object({
    fairness: z.enum(['green','yellow','red']).optional(),
  }).optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export type Employee = z.infer<typeof employeeSchema>;

export const shiftEventSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  role: z.string(),
  start: z.coerce.date(),
  end: z.coerce.date(),
});

export type ShiftEvent = z.infer<typeof shiftEventSchema>;

// --- Backend DTO schemas (scheduler API) ---
// Roles as emitted/accepted by Emil's backend.
export const schedulerRoleSchema = z.enum(['MANAGER', 'BARISTA', 'WAITER', 'SANDWICH']);

// EmployeeDTO: data coming from the backend
export const employeeDtoSchema = z.object({
  employeeId: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  roles: z.array(schedulerRoleSchema),
  skills: z.record(z.string(), z.number()).optional(), // e.g. { BARISTA: 0.82 }
  isActive: z.boolean().default(true),
});
export type EmployeeDTO = z.infer<typeof employeeDtoSchema>;
export const employeesDtoSchema = z.array(employeeDtoSchema);

// ShiftDTO: a shift “container” and its requirements per role
export const shiftDtoSchema = z.object({
  id: z.number(),
  date: z.string(), // 'YYYY-MM-DD'
  week: z.string(), // 'YYYY-Www', e.g. '2025-W46'
  required: z.record(schedulerRoleSchema, z.number()), // { BARISTA: 2, ... }
});
export type ShiftDTO = z.infer<typeof shiftDtoSchema>;
export const shiftsDtoSchema = z.array(shiftDtoSchema);

// AssignmentDTO: solver output linking an employee to a shift and role
export const assignmentDtoSchema = z.object({
  id: z.number(),
  shiftId: z.number(),
  employeeId: z.number(),
  role: schedulerRoleSchema,
});
export type AssignmentDTO = z.infer<typeof assignmentDtoSchema>;
export const assignmentsDtoSchema = z.array(assignmentDtoSchema);
