import { z } from 'zod';

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  unreadOnly: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
});

export const notificationIdSchema = z.object({
  id: z.string().uuid('Invalid notification ID'),
});

export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;
