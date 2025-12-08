// src/modules/discovery/types.ts
export type DiscoverySource =
  | 'core'
  | 'openalex'
  | 'doaj'      // Added
  | 'eric'      // Added
  | 'doab';     // Added

export interface DiscoveryResult {
  id: string;
  title: string;
  authors?: string[];
  abstract?: string;
  publishedDate?: string;
  source: DiscoverySource;
  url: string;
  doi?: string
  pdfUrl?: string;
  subjects?: string[];
}

export interface DiscoverySearchQuery {
  q: string;
  page?: number;
  limit?: number;
  source?: DiscoverySource | DiscoverySource[];
  subject?: string;
}