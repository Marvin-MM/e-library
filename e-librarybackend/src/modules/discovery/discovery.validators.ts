// src/modules/discovery/discovery.validators.ts
import { z } from 'zod';

const DiscoverySourceEnum = z.enum(['core', 'openalex', 'doaj', 'eric', 'doab', 'googleScholar']);

export const discoverySearchSchema = z.object({
  q: z.string().min(2, 'Search term too short').max(200),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20),
  source: z
    .any()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const arr = Array.isArray(val) ? val : typeof val === 'string' ? val.split(',') : [val];
      return arr.map((v: any) => (typeof v === 'string' ? v.trim() : v));
    })
    .pipe(z.array(DiscoverySourceEnum).optional()),
});

export type DiscoverySearchInput = z.infer<typeof discoverySearchSchema>;