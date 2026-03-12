import { z } from 'zod';

export const analyticsDateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
}).refine(data => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate);
  }
  return true;
}, {
  message: "startDate must be before or equal to endDate",
  path: ["startDate"]
});

export const analyticsLimitSchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type AnalyticsDateRangeInput = z.infer<typeof analyticsDateRangeSchema>;
export type AnalyticsLimitInput = z.infer<typeof analyticsLimitSchema>;
