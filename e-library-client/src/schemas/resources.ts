// import { z } from "zod";

// const MAX_FILE_SIZE = 50 * 1024 * 1024;
// const ACCEPTED_FILE_TYPES = [
//   "application/pdf",
//   "application/msword",
//   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   "application/vnd.ms-excel",
//   "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   "application/vnd.ms-powerpoint",
//   "application/vnd.openxmlformats-officedocument.presentationml.presentation",
//   "image/jpeg",
//   "image/png",
//   "image/gif",
//   "image/webp",
//   "video/mp4",
//   "video/webm",
//   "audio/mpeg",
//   "audio/wav",
//   "text/plain",
//   "application/zip",
// ];

// export const resourceTypeOptions = [
//   { value: "PDF", label: "PDF Document" },
//   { value: "VIDEO", label: "Video" },
//   { value: "DOCUMENT", label: "Document" },
//   { value: "IMAGE", label: "Image" },
//   { value: "AUDIO", label: "Audio" },
//   { value: "OTHER", label: "Other" },
// ] as const;

// export const categoryOptions = [
//   { value: "BOOK", label: "Book" },
//   { value: "JOURNAL", label: "Journal" },
//   { value: "PAPER", label: "Paper" },
//   { value: "MAGAZINE", label: "Magazine" },
//   { value: "THESIS", label: "Thesis" },
//   { value: "OTHER", label: "Other" },
// ] as const;

// // export const categoryOptions = [
// //   { value: "lecture-notes", label: "Lecture Notes" },
// //   { value: "textbooks", label: "Textbooks" },
// //   { value: "assignments", label: "Assignments" },
// //   { value: "past-exams", label: "Past Exams" },
// //   { value: "tutorials", label: "Tutorials" },
// //   { value: "research-papers", label: "Research Papers" },
// //   { value: "presentations", label: "Presentations" },
// //   { value: "other", label: "Other" },
// // ] as const;


// export const createResourceSchema = z.object({
//   title: z
//     .string()
//     .min(1, "Title is required")
//     .min(3, "Title must be at least 3 characters")
//     .max(200, "Title must be less than 200 characters"),
//   description: z
//     .string()
//     .min(1, "Description is required")
//     .min(10, "Description must be at least 10 characters")
//     .max(2000, "Description must be less than 2000 characters"),
//   type: z.enum(["PDF", "VIDEO", "DOCUMENT", "IMAGE", "AUDIO", "OTHER"]),
//   category: z.enum(["BOOK", "JOURNAL", "PAPER", "MAGAZINE", "THESIS", "OTHER"]),
//   courseId: z.string().optional(),
//   tags: z.array(z.string()).optional(),
//   isPublic: z.boolean().default(true),
//   file: z
//     .custom<File>()
//     .refine((file) => file instanceof File, "Please select a file")
//     .refine((file) => file.size <= MAX_FILE_SIZE, "File size must be less than 50MB")
//     .refine(
//       (file) => ACCEPTED_FILE_TYPES.includes(file.type),
//       "File type not supported"
//     ),
// });

// export type CreateResourceFormData = z.infer<typeof createResourceSchema>;

// export const updateResourceSchema = createResourceSchema.partial().omit({ file: true });

// export type UpdateResourceFormData = z.infer<typeof updateResourceSchema>;

import { z } from "zod";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/epub+zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export const resourceTypeOptions = [
  { value: "PDF", label: "PDF Document" },
  { value: "DOCUMENT", label: "Document" },
  { value: "PRESENTATION", label: "Presentation" },
  { value: "OTHER", label: "Other" },
] as const;

export const resourceCategoryEnum = z.enum(['BOOK', 'JOURNAL', 'PAPER', 'MAGAZINE', 'THESIS', 'OTHER']);
export const accessTypeEnum = z.enum(['VIEW_ONLY', 'DOWNLOADABLE']);

export const categoryOptions = [
  { value: "BOOK", label: "Book" },
  { value: "JOURNAL", label: "Journal" },
  { value: "PAPER", label: "Paper" },
  { value: "MAGAZINE", label: "Magazine" },
  { value: "THESIS", label: "Thesis" },
  { value: "OTHER", label: "Other" },
] as const;

export const createResourceSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be less than 200 characters"),
  description: z
    .string()
    .max(2000, "Description must be less than 2000 characters")
    .optional(),
  category: resourceCategoryEnum,
  department: z.string().min(1, "Department is required").max(200),
  authors: z.array(z.string()).min(1, "At least one author is required"),
  publicationYear: z.coerce.number()
    .int()
    .min(1800)
    .max(new Date().getFullYear() + 1)
    .optional(),
  accessType: accessTypeEnum.default('DOWNLOADABLE'),
  tags: z.array(z.string()).default([]),
  courseIds: z.array(z.string()).default([]),
  file: z
    .custom<File>()
    .refine((file) => file instanceof File, "Please select a file")
    .refine((file) => file.size <= MAX_FILE_SIZE, "File size must be less than 50MB")
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "File type not supported. Only PDF, EPUB, DOC, DOCX, PPT, and PPTX files are allowed."
    ),
});

export type CreateResourceFormData = z.infer<typeof createResourceSchema>;

export const updateResourceSchema = createResourceSchema.partial().omit({ file: true });

export type UpdateResourceFormData = z.infer<typeof updateResourceSchema>;