import prisma from '../../config/database.js';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';
import { getRedisClient, isRedisConnected } from '../../config/redis.js';
import type { UpdateUserRoleInput, UserQueryInput, AuditLogQueryInput } from './admin.validators.js';

const CACHE_TTL = 300;

export class AdminService {
  async getUsers(query: UserQueryInput) {
    const rawPage = (query as any).page ?? 1;
    const rawLimit = (query as any).limit ?? 20;

    const page = Number.isFinite(Number(rawPage)) && Number(rawPage) > 0
      ? Math.floor(Number(rawPage))
      : 1;
    const limit = Number.isFinite(Number(rawLimit)) && Number(rawLimit) > 0
      ? Math.floor(Number(rawLimit))
      : 20;

    const { role, search } = query;

    const sortBy = (query as any).sortBy ?? 'createdAt';
    const sortOrder = (query as any).sortOrder ?? 'desc';

    const where: Record<string, unknown> = {};

    if (role) where.role = role;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Record<string, string> = {
      [sortBy]: sortOrder,
    };

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: where as any,
        take: limit,
        skip,
        orderBy: orderBy as any,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              uploadedResources: true,
              downloadLogs: true,
              requests: true,
            },
          },
        },
      }),
      prisma.user.count({ where: where as any }),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            uploadedResources: true,
            downloadLogs: true,
            requests: true,
            searchLogs: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  async updateUserRole(id: string, data: UpdateUserRoleInput, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.id === adminId) {
      throw new BadRequestError('Cannot change your own role');
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: { role: data.role },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await tx.auditLog.create({
        data: {
          entity: 'User',
          entityId: id,
          action: 'UPDATE_ROLE',
          performedById: adminId,
          meta: { previousRole: user.role, newRole: data.role },
        },
      });

      return updated;
    });

    logger.info('User role updated', { userId: id, adminId, newRole: data.role });

    return updatedUser;
  }

  async getMetrics() {
    const cacheKey = 'admin:metrics';

    if (isRedisConnected()) {
      const cached = await getRedisClient().get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      usersByRole,
      totalResources,
      totalDownloads,
      recentDownloads,
      totalSearches,
      recentSearches,
      pendingRequests,
      topSearchTerms,
      topResources,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true },
      }),
      prisma.resource.count({ where: { isActive: true } }),
      prisma.downloadLog.count(),
      prisma.downloadLog.count({
        where: { timestamp: { gte: thirtyDaysAgo } },
      }),
      prisma.searchLog.count(),
      prisma.searchLog.count({
        where: { timestamp: { gte: thirtyDaysAgo } },
      }),
      prisma.request.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }),
      prisma.searchLog.groupBy({
        by: ['query'],
        _count: { query: true },
        orderBy: { _count: { query: 'desc' } },
        take: 10,
      }),
      prisma.resource.findMany({
        where: { isActive: true },
        orderBy: { downloadCount: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          downloadCount: true,
          viewCount: true,
        },
      }),
    ]);

    const metrics = {
      users: {
        total: totalUsers,
        byRole: Object.fromEntries(
          usersByRole.map(item => [item.role, item._count.role])
        ),
      },
      resources: {
        total: totalResources,
        topResources,
      },
      downloads: {
        total: totalDownloads,
        recent: recentDownloads,
      },
      searches: {
        total: totalSearches,
        recent: recentSearches,
        topTerms: topSearchTerms.map(item => ({
          query: item.query,
          count: item._count.query,
        })),
      },
      requests: {
        pending: pendingRequests,
      },
      generatedAt: new Date().toISOString(),
    };

    if (isRedisConnected()) {
      await getRedisClient().setex(cacheKey, CACHE_TTL, JSON.stringify(metrics));
    }

    return metrics;
  }

  async getAuditLogs(query: AuditLogQueryInput) {
    const { page, limit, entity, action, performedById, startDate, endDate } = query;

    const where: Record<string, unknown> = {};

    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (performedById) where.performedById = performedById;
    if (startDate) where.timestamp = { gte: new Date(startDate) };
    if (endDate) where.timestamp = { ...((where.timestamp as object) || {}), lte: new Date(endDate) };

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: where as any,
        take: limit,
        skip,
        orderBy: { timestamp: 'desc' },
        include: {
          performedBy: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.auditLog.count({ where: where as any }),
    ]);

    return {
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async deleteUser(id: string, adminId: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.id === adminId) {
      throw new BadRequestError('Cannot delete your own account');
    }

    if (user.role === 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      });

      if (adminCount <= 1) {
        throw new BadRequestError('Cannot delete the last admin');
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.delete({
        where: { id },
      });

      await tx.auditLog.create({
        data: {
          entity: 'User',
          entityId: id,
          action: 'DELETE',
          performedById: adminId,
          meta: { email: user.email, role: user.role },
        },
      });
    });

    logger.info('User deleted', { userId: id, adminId });

    return { message: 'User deleted successfully' };
  }
}

export const adminService = new AdminService();
