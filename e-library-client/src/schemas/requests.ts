import { z } from "zod";

export const statusOptions = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REJECTED", label: "Rejected" },
] as const;

export const createRequestSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  authors: z.string().optional(),
  reason: z
    .string()
    .min(1, "Reason is required")
    .min(10, "Reason must be at least 10 characters")
    .max(5000, "Reason must be less than 5000 characters"),
  category: z.enum(["BOOK", "JOURNAL", "PAPER", "MAGAZINE", "THESIS", "OTHER"]).optional(),
});

export type CreateRequestFormData = z.infer<typeof createRequestSchema>;

export const updateRequestSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"]).optional(),
  adminReply: z.string().max(1000, "Reply must be less than 1000 characters").optional(),
});

export type UpdateRequestFormData = z.infer<typeof updateRequestSchema>;
