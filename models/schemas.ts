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
