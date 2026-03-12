// src/modules/discovery/discovery.service.ts
import { OATDClient } from './sources/oatd.client.js';
import { AGRISClient } from './sources/agris.client.js';
import { NotFoundError } from '../../shared/errors/AppError.js';
import type { DiscoverySearchQuery, DiscoveryResult } from './types.js';
import { logger } from '../../shared/utils/logger.js';
import { getRedisClient, isRedisConnected } from '../../config/redis.js';
import { COREClient } from './sources/core.client.js';
import { OpenAlexClient } from './sources/openalex.client.js';
import { DOAJClient } from './sources/doaj.client.js';
import { ERICClient } from './sources/eric.client.js';
import { DOABClient } from './sources/doab.client.js';
import { GoogleScholarClient } from './sources/google-scholar.client.js';

const CACHE_TTL = 600; // 10 minutes — external API results change slowly

const clients = {
  openalex: new OpenAlexClient(),
  core: new COREClient(),
  doaj: new DOAJClient(),
  eric: new ERICClient(),
  doab: new DOABClient(),
  googleScholar: new GoogleScholarClient(), // Requires SERPAPI_KEY
  // oatd: new OATDClient(),
  // agris: new AGRISClient(),
} as const;
export class DiscoveryService {
  private async searchSource(
    source: keyof typeof clients,
    query: DiscoverySearchQuery
  ) {
    if (!clients[source]) throw new NotFoundError('Source not supported');

    try {
      const result = await clients[source].search(query);
      return result;
    } catch (error) {
      logger.warn(`Discovery search failed for source: ${source}`, { error });
      return { results: [], total: 0 };
    }
  }

  // Update the search method in discovery.service.ts
  async search(query: DiscoverySearchQuery) {
    const { q, source, page = 1, limit = 20 } = query;

    // Build a cache key that captures the complete query shape
    const cacheKey = `discovery:search:${JSON.stringify({ q, source, page, limit })}`;

    if (isRedisConnected()) {
      const cached = await getRedisClient().get(cacheKey);
      if (cached) {
        logger.debug('Discovery cache hit', { cacheKey });
        return JSON.parse(cached);
      }
    }

    const sourcesToSearch = source
      ? Array.isArray(source)
        ? (source as (keyof typeof clients)[])
        : [source as keyof typeof clients]
      : (Object.keys(clients) as (keyof typeof clients)[]);

    logger.info(`Discovery search across sources: ${sourcesToSearch.join(', ')}`, { q, page, limit });

    const searches = sourcesToSearch.map((src) =>
      this.searchSource(src, { ...query, page, limit })
    );

    const results = await Promise.allSettled(searches);

    let allResults: DiscoveryResult[] = [];

    results.forEach((res, idx) => {
      const sourceName = sourcesToSearch[idx];
      if (res.status === 'fulfilled') {
        logger.debug(`Discovery source ${sourceName}: ${res.value.results.length} results`);
        allResults.push(...res.value.results);
      } else {
        logger.warn(`Discovery source ${sourceName} failed`, { reason: res.reason });
      }
    });

    // Remove duplicates based on title and authors
    const uniqueResults = this.removeDuplicates(allResults);

    // Sort by relevance (title match, then date recency)
    uniqueResults.sort((a, b) => {
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      const queryLower = q.toLowerCase();

      // Exact match in title gets highest priority
      if (aTitle === queryLower && bTitle !== queryLower) return -1;
      if (bTitle === queryLower && aTitle !== queryLower) return 1;

      // Contains query in title
      const aContains = aTitle.includes(queryLower);
      const bContains = bTitle.includes(queryLower);
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;

      // More recent first
      const aYear = parseInt(a.publishedDate || '0');
      const bYear = parseInt(b.publishedDate || '0');
      if (aYear && bYear) return bYear - aYear;

      // Alphabetical fallback
      return aTitle.localeCompare(bTitle);
    });

    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginated = uniqueResults.slice(startIdx, endIdx);

    const response = {
      data: paginated,
      pagination: {
        total: uniqueResults.length,
        page,
        limit,
        totalPages: Math.ceil(uniqueResults.length / limit),
        sources: sourcesToSearch,
      },
    };

    if (isRedisConnected()) {
      getRedisClient().setex(cacheKey, CACHE_TTL, JSON.stringify(response)).catch(err =>
        logger.warn('Failed to cache discovery result', { err })
      );
    }

    return response;
  }

  private removeDuplicates(results: DiscoveryResult[]): DiscoveryResult[] {
    const seen = new Set<string>();
    return results.filter(item => {
      // Create a unique key from title and first author
      const firstAuthor = item.authors?.[0] || '';
      const key = `${item.title.toLowerCase()}-${firstAuthor.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }


  async getSources() {
    return Object.keys(clients).map((key) => ({
      id: key,
      name: key.toUpperCase(),
      description: `${key} Open Access Repository`,
      free: true,
    }));
  }
}

export const discoveryService = new DiscoveryService();