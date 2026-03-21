import { z } from 'zod';
// ── Book CRUD ──────────────────────────────────────────────────────────────
export const createBookSchema = z.object({
  title: z.string().min(1).max(500),
  author: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  isbn: z.string().max(20).optional(),
  campusId: z.string().uuid('Invalid campus ID'),
  copies: z.coerce.number().int().min(0).optional().default(1),
});
export const updateBookSchema = createBookSchema.partial();
// ── Catalog query ──────────────────────────────────────────────────────────
export const bookQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().max(200).optional(),
  campusId: z.string().uuid().optional(),
  availableOnly: z.coerce.boolean().default(false),
});
// ── Borrowing ──────────────────────────────────────────────────────────────
export const borrowSchema = z.object({
  bookId: z.string().uuid('Invalid book ID'),
  campusId: z.string().uuid('Invalid campus ID'),
});
// ── Inventory ──────────────────────────────────────────────────────────────
export const inventoryUpsertSchema = z.object({
  bookId: z.string().uuid('Invalid book ID'),
  campusId: z.string().uuid('Invalid campus ID'),
  totalCopies: z.number().int().min(0),
  shelfLocation: z.string().max(100).optional(),
});
// ── Admin borrow records query ─────────────────────────────────────────────
export const borrowRecordQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(['ACTIVE', 'RETURNED', 'OVERDUE']).optional(),
  overdue: z.coerce.boolean().optional(),
  campusId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});
// ── Param schemas ──────────────────────────────────────────────────────────
export const bookIdParamSchema = z.object({
  id: z.string().uuid('Invalid book ID'),
});
export const borrowIdParamSchema = z.object({
  id: z.string().uuid('Invalid borrow record ID'),
});
// Add this under your Book CRUD or create a new section for Campus
export const createCampusSchema = z.object({
  name: z.string().min(1, 'Campus name is required').max(255),
  code: z.string().min(1, 'Campus code is required').max(50),
  address: z.string().max(1000).optional(),
});

// Add to your Types at the bottom
export type CreateCampusInput = z.infer<typeof createCampusSchema>;
// ── Types ──────────────────────────────────────────────────────────────────
export type CreateBookInput       = z.infer<typeof createBookSchema>;
export type UpdateBookInput       = z.infer<typeof updateBookSchema>;
export type BookQueryInput        = z.infer<typeof bookQuerySchema>;
export type BorrowInput           = z.infer<typeof borrowSchema>;
export type InventoryUpsertInput  = z.infer<typeof inventoryUpsertSchema>;
export type BorrowRecordQueryInput = z.infer<typeof borrowRecordQuerySchema>;
