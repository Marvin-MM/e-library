// src/modules/discovery/sources/openalex.client.ts
import axios from 'axios';
import { BaseDiscoverySource } from './base.source.js';
import type { DiscoveryResult, DiscoverySearchQuery } from '../types.js';
import { logger } from '../../../shared/utils/logger.js';

export class OpenAlexClient extends BaseDiscoverySource {
  name = 'openalex' as const;

  async search({ q, page = 1, limit = 20 }: DiscoverySearchQuery) {
    try {
      const response = await axios.get('https://api.openalex.org/works', {
        params: {
          search: q,
          per_page: limit,
          page,
          filter: 'open_access.is_oa:true',
          sort: 'cited_by_count:desc',
        },
        headers: {
          'User-Agent': 'VictoriaUniversityLMS/1.0[](https://vu.ac.ug)',
          'Email': 'library@vu.ac.ug',
        },
        timeout: 15000,
      });

      const results: DiscoveryResult[] = response.data.results.map((work: any) => ({
        id: `oa-${work.id.split('/').pop()}`,
        title: work.display_name || 'No title',
        authors: work.authorships.map((a: any) => a.author.display_name).filter(Boolean),
        abstract: work.abstract_inverted_index ? 'Available' : undefined,
        publishedDate: work.publication_year?.toString(),
        source: this.name,
        url: work.primary_location?.landing_page_url || work.doi || `https://openalex.org/${work.id}`,
        pdfUrl: work.open_access?.oa_url || undefined,
        doi: work.doi?.replace('https://doi.org/', ''),
        subjects: work.concepts?.map((c: any) => c.display_name),
      }));

      return { results, total: response.data.meta.count };
    } catch (error: any) {
      logger.warn('OpenAlex API error', { message: error.message });
      return { results: [], total: 0 };
    }
  }

  async harvest(): Promise<void> {
    logger.debug(`${this.name}: Harvest not implemented`);
  }
}