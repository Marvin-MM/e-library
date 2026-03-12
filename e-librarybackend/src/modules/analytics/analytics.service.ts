import prisma from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';
import { getRedisClient, isRedisConnected } from '../../config/redis.js';

const CACHE_TTL = 3600; // 1 hour for analytics

export interface AnalyticsDateRange {
    startDate?: Date;
    endDate?: Date;
}

export interface OverviewStats {
    totalUsers: number;
    totalResources: number;
    totalDownloads: number;
    totalSearches: number;
    totalRequests: number;
    pendingRequests: number;
}

export interface TrendData {
    date: string;
    downloads: number;
    searches: number;
    signups: number;
}

export class AnalyticsService {
    /**
     * Get overview statistics
     */
    async getOverview(): Promise<OverviewStats> {
        const cacheKey = 'analytics:overview';

        if (isRedisConnected()) {
            const cached = await getRedisClient().get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }

        const [
            totalUsers,
            totalResources,
            totalDownloads,
            totalSearches,
            totalRequests,
            pendingRequests,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.resource.count({ where: { isActive: true } }),
            prisma.downloadLog.count(),
            prisma.searchLog.count(),
            prisma.request.count(),
            prisma.request.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
        ]);

        const stats = {
            totalUsers,
            totalResources,
            totalDownloads,
            totalSearches,
            totalRequests,
            pendingRequests,
        };

        if (isRedisConnected()) {
            await getRedisClient().setex(cacheKey, CACHE_TTL, JSON.stringify(stats));
        }

        return stats;
    }

    /**
     * Get download trends over time
     */
    async getDownloadTrends(range: AnalyticsDateRange = {}) {
        const endDate = range.endDate || new Date();
        const startDate = range.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        const cacheKey = `analytics:trends:downloads:${startDate.toISOString()}:${endDate.toISOString()}`;

        if (isRedisConnected()) {
            const cached = await getRedisClient().get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }

        const downloads = await prisma.downloadLog.groupBy({
            by: ['timestamp'],
            where: {
                timestamp: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _count: { id: true },
        });

        // Aggregate by date
        const dailyData: Record<string, number> = {};
        downloads.forEach((d) => {
            const dateKey = d.timestamp.toISOString().split('T')[0];
            dailyData[dateKey] = (dailyData[dateKey] || 0) + d._count.id;
        });

        const result = Object.entries(dailyData)
            .map(([date, count]) => ({ date, downloads: count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        if (isRedisConnected()) {
            await getRedisClient().setex(cacheKey, CACHE_TTL, JSON.stringify(result));
        }

        return result;
    }

    /**
     * Get top downloaded resources
     */
    async getTopResources(limit: number = 10) {
        const cacheKey = `analytics:top:resources:${limit}`;

        if (isRedisConnected()) {
            const cached = await getRedisClient().get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }

        const resources = await prisma.resource.findMany({
            where: { isActive: true },
            orderBy: [{ downloadCount: 'desc' }, { id: 'asc' }],
            take: limit,
            select: {
                id: true,
                title: true,
                authors: true,
                category: true,
                downloadCount: true,
                viewCount: true,
            },
        });

        if (isRedisConnected()) {
            await getRedisClient().setex(cacheKey, CACHE_TTL, JSON.stringify(resources));
        }

        return resources;
    }

    /**
     * Get top search terms
     */
    async getTopSearchTerms(limit: number = 20) {
        const cacheKey = `analytics:top:searches:${limit}`;

        if (isRedisConnected()) {
            const cached = await getRedisClient().get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }

        const searches = await prisma.searchLog.groupBy({
            by: ['query'],
            _count: { query: true },
            orderBy: { _count: { query: 'desc' } },
            take: limit,
        });

        const result = searches.map((s) => ({
            term: s.query,
            count: s._count.query,
        }));

        if (isRedisConnected()) {
            await getRedisClient().setex(cacheKey, CACHE_TTL, JSON.stringify(result));
        }

        return result;
    }

    /**
     * Get user registration trends
     */
    async getUserTrends(range: AnalyticsDateRange = {}) {
        const endDate = range.endDate || new Date();
        const startDate = range.startDate || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        const cacheKey = `analytics:trends:users:${startDate.toISOString()}:${endDate.toISOString()}`;

        if (isRedisConnected()) {
            const cached = await getRedisClient().get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }

        const users = await prisma.user.groupBy({
            by: ['createdAt'],
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _count: { id: true },
        });

        const dailyData: Record<string, number> = {};
        users.forEach((u) => {
            const dateKey = u.createdAt.toISOString().split('T')[0];
            dailyData[dateKey] = (dailyData[dateKey] || 0) + u._count.id;
        });

        const result = Object.entries(dailyData)
            .map(([date, count]) => ({ date, signups: count }))
            .sort((a, b) => a.date.localeCompare(b.date));

        if (isRedisConnected()) {
            await getRedisClient().setex(cacheKey, CACHE_TTL, JSON.stringify(result));
        }

        return result;
    }

    /**
     * Get users by role distribution
     */
    async getUsersByRole() {
        const users = await prisma.user.groupBy({
            by: ['role'],
            _count: { role: true },
        });

        return users.map((u) => ({
            role: u.role,
            count: u._count.role,
        }));
    }

    /**
     * Get resources by category distribution
     */
    async getResourcesByCategory() {
        const cacheKey = 'analytics:distribution:resources';

        if (isRedisConnected()) {
            const cached = await getRedisClient().get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        }

        const resources = await prisma.resource.groupBy({
            by: ['category'],
            where: { isActive: true },
            _count: { category: true },
        });

        const result = resources.map((r) => ({
            category: r.category,
            count: r._count.category,
        }));

        if (isRedisConnected()) {
            await getRedisClient().setex(cacheKey, CACHE_TTL, JSON.stringify(result));
        }

        return result;
    }

    /**
     * Get request statistics
     */
    async getRequestStats() {
        const [byStatus, byPriority, recentRequests] = await Promise.all([
            prisma.request.groupBy({
                by: ['status'],
                _count: { status: true },
            }),
            prisma.request.groupBy({
                by: ['priority'],
                _count: { priority: true },
            }),
            prisma.request.count({
                where: {
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                },
            }),
        ]);

        return {
            byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.status })),
            byPriority: byPriority.map((p) => ({ priority: p.priority, count: p._count.priority })),
            lastWeekCount: recentRequests,
        };
    }

    /**
     * Generate a comprehensive report
     */
    async generateReport(range: AnalyticsDateRange = {}) {
        const [
            overview,
            downloadTrends,
            userTrends,
            topResources,
            topSearchTerms,
            usersByRole,
            resourcesByCategory,
            requestStats,
        ] = await Promise.all([
            this.getOverview(),
            this.getDownloadTrends(range),
            this.getUserTrends(range),
            this.getTopResources(10),
            this.getTopSearchTerms(20),
            this.getUsersByRole(),
            this.getResourcesByCategory(),
            this.getRequestStats(),
        ]);

        return {
            generatedAt: new Date().toISOString(),
            dateRange: {
                start: range.startDate?.toISOString() || 'last 30 days',
                end: range.endDate?.toISOString() || 'now',
            },
            overview,
            trends: {
                downloads: downloadTrends,
                users: userTrends,
            },
            topResources,
            topSearchTerms,
            distributions: {
                usersByRole,
                resourcesByCategory,
            },
            requestStats,
        };
    }
}

export const analyticsService = new AnalyticsService();
