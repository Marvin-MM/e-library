// src/modules/discovery/sources/google-scholar.client.ts
/**
 * Google Scholar Client
 * Uses Serper API for reliable Google Scholar search results
 * Requires SERPER_API_KEY environment variable
 */

import axios from 'axios';
import type { DiscoverySearchQuery, DiscoveryResult } from '../types.js';
import { logger } from '../../../shared/utils/logger.js';

interface SerperScholarResult {
    title: string;
    link: string;
    snippet: string;
    publicationInfo?: string;
    year?: number;
    citedBy?: number;
    date?: string;
    attributes?: Record<string, string>;
}

interface SerperResponse {
    organic?: SerperScholarResult[];
    searchParameters?: {
        q: string;
    };
    message?: string; // For errors
}

export class GoogleScholarClient {
    private apiKey: string | undefined;
    private baseUrl = 'https://google.serper.dev/scholar';

    constructor() {
        this.apiKey = process.env.SERPER_API_KEY;
    }

    async search(query: DiscoverySearchQuery): Promise<{ results: DiscoveryResult[]; total: number }> {
        if (!this.apiKey) {
            logger.warn('SERPER_API_KEY not configured - Google Scholar search disabled');
            return { results: [], total: 0 };
        }

        const { q, page = 1, limit = 20 } = query;

        try {
            const response = await axios.post<SerperResponse>(
                this.baseUrl,
                {
                    q: q,
                    page: page,
                    num: Math.min(limit, 20)
                },
                {
                    headers: {
                        'X-API-KEY': this.apiKey,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000,
                }
            );

            const data = response.data;

            if (data.message) {
                logger.warn('Serper API returned message', { message: data.message });
            }

            const results: DiscoveryResult[] = (data.organic || []).map((item) => {
                // Extract year from publication info if year field is missing
                let publishedDate = item.year?.toString() || item.date;
                if (!publishedDate && item.publicationInfo) {
                    const yearMatch = item.publicationInfo.match(/\b(19|20)\d{2}\b/);
                    if (yearMatch) {
                        publishedDate = yearMatch[0];
                    }
                }
                if (!publishedDate && item.attributes?.['Date']) {
                    publishedDate = item.attributes['Date'];
                }

                // Extract authors from publicationInfo (usually everything before the first hyphen)
                let authors: string[] = [];
                if (item.publicationInfo) {
                    const authorPart = item.publicationInfo.split('-')[0];
                    if (authorPart) {
                        authors = authorPart.split(',').map(a => a.trim()).filter(Boolean);
                    }
                } else if (item.attributes?.['Related People'] || item.attributes?.['Founders']) {
                    // Fallback for standard search schema
                    const peopleStr = item.attributes['Related People'] || item.attributes['Founders'] || '';
                    authors = peopleStr.split(/(?:,|;|\s(?=[A-Z]))/).map(a => a.trim()).filter(Boolean);
                }

                return {
                    id: `gs-${Buffer.from(item.link || '').toString('base64').slice(0, 20)}`,
                    title: item.title || 'Untitled',
                    authors,
                    description: item.snippet,
                    source: 'googleScholar' as const,
                    url: item.link,
                    pdfUrl: item.link?.toLowerCase().endsWith('.pdf') ? item.link : undefined,
                    publishedDate,
                    citedBy: item.citedBy,
                };
            });

            // Serper doesn't always provide total results easily for scholar, we estimate from length
            const total = results.length;

            return { results, total };
        } catch (error: any) {
            logger.warn('Google Scholar search failed', { error: error.message || error });
            return { results: [], total: 0 };
        }
    }
}
