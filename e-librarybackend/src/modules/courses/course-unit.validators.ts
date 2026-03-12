import { z } from 'zod';

export const createCourseUnitSchema = z.object({
  code: z.string().min(2, 'Unit code is required').max(20, 'Unit code too long'),
  name: z.string().min(2, 'Unit name is required').max(200, 'Unit name too long'),
  description: z.string().max(2000, 'Description too long').optional(),
});

export const updateCourseUnitSchema = z.object({
  code: z.string().min(2).max(20).optional(),
  name: z.string().min(2).max(200).optional(),
  description: z.string().max(2000).optional(),
});

export const courseUnitQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().max(100).optional(),
});

export const courseUnitParamsSchema = z.object({
  courseId: z.string().uuid('Invalid course ID').optional(),
  unitId: z.string().uuid('Invalid unit ID').optional(),
});

export type CreateCourseUnitInput = z.infer<typeof createCourseUnitSchema>;
export type UpdateCourseUnitInput = z.infer<typeof updateCourseUnitSchema>;
export type CourseUnitQueryInput = z.infer<typeof courseUnitQuerySchema>;
