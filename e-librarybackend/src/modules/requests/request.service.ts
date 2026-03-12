import prisma from '../../config/database.js';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';
import { emailQueue } from '../queue/email.queue.js';
import type { CreateRequestInput, UpdateRequestInput, RequestQueryInput, RespondRequestInput } from './request.validators.js';

type RequestStatusType = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
type RequestPriorityType = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type RequestCategoryType = 'BOOK' | 'JOURNAL' | 'PAPER' | 'THESIS' | 'EQUIPMENT' | 'OTHER';

interface EnhancedCreateRequestInput extends CreateRequestInput {
  priority?: RequestPriorityType;
  category?: RequestCategoryType;
  dueDate?: Date;
}

export class RequestService {
  async create(data: EnhancedCreateRequestInput, userId: string) {
    const request = await prisma.$transaction(async (tx) => {
      const newRequest = await tx.request.create({
        data: {
          title: data.title,
          authors: data.authors,
          reason: data.reason,
          userId,
          priority: (data.priority as any) || 'MEDIUM',
          category: data.category as any,
          dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          entity: 'Request',
          entityId: newRequest.id,
          action: 'CREATE',
          performedById: userId,
          meta: {
            title: newRequest.title,
            priority: data.priority || 'MEDIUM',
            category: data.category,
          },
        },
      });

      return newRequest;
    });

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, name: true },
    });

    const priorityLabel = data.priority === 'URGENT' ? '🔴 URGENT' :
      data.priority === 'HIGH' ? '🟠 HIGH' :
        data.priority === 'LOW' ? '🟢 LOW' : '🟡 MEDIUM';

    Promise.all(admins.map(admin => 
      emailQueue.addGenericEmail({
        to: admin.email,
        subject: `[${priorityLabel}] New Resource Request: ${request.title}`,
        html: `
          <h1>New Resource Request</h1>
          <p>A new resource request has been submitted:</p>
          <p><strong>Title:</strong> ${request.title}</p>
          <p><strong>Authors:</strong> ${request.authors || 'Not specified'}</p>
          <p><strong>Priority:</strong> ${priorityLabel}</p>
          <p><strong>Category:</strong> ${data.category || 'Not specified'}</p>
          <p><strong>Due Date:</strong> ${data.dueDate ? new Date(data.dueDate).toLocaleDateString() : 'Not specified'}</p>
          <p><strong>Reason:</strong> ${request.reason}</p>
          <p><strong>Requested by:</strong> ${request.user.name} (${request.user.email})</p>
          <p>Please review and respond to this request.</p>
        `,
      }).catch(err => {
        logger.warn('Failed to send admin notification for request', { err, adminEmail: admin.email });
      })
    ));

    logger.info('Resource request created', { requestId: request.id, userId, priority: data.priority });

    return request;
  }

  async findById(id: string, userId?: string, isAdmin: boolean = false) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundError('Request not found');
    }

    if (!isAdmin && userId && request.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    return request;
  }

  async findAll(query: RequestQueryInput, userId?: string, isAdmin: boolean = false) {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const { status, userId: filterUserId } = query;

    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (isAdmin && filterUserId) where.userId = filterUserId;
    if (!isAdmin && userId) where.userId = userId;

    const orderBy = [
      { [sortBy]: sortOrder },
      { id: 'asc' }
    ];

    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
      prisma.request.findMany({
        where: where as any,
        take: limit,
        skip,
        orderBy: orderBy as any,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.request.count({ where: where as any }),
    ]);

    return {
      data: requests,
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

  async findUserRequests(userId: string, query: RequestQueryInput) {
    return this.findAll({ ...query, userId }, userId, false);
  }

  async update(id: string, data: UpdateRequestInput, adminId: string) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundError('Request not found');
    }

    const updatePayload: Record<string, unknown> = { ...data };

    if (data.status && (data.status === 'RESOLVED' || data.status === 'REJECTED')) {
      updatePayload.resolvedAt = new Date();
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      const updated = await tx.request.update({
        where: { id },
        data: updatePayload as any,
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          entity: 'Request',
          entityId: id,
          action: 'UPDATE',
          performedById: adminId,
          meta: { changes: data, previousStatus: request.status },
        },
      });

      return updated;
    });

    if (data.status && data.status !== request.status) {
      emailQueue.addRequestStatusEmail({
        to: request.user.email,
        name: request.user.name,
        requestTitle: request.title,
        status: data.status,
        adminReply: data.adminReply,
      }).catch(err => {
        logger.warn('Failed to send request status email', { err });
      });
    }

    logger.info('Request updated', { requestId: id, adminId, newStatus: data.status });

    return updatedRequest;
  }

  /**
   * Enhanced admin response to a request with structured access information
   */
  async respondToRequest(
    id: string,
    response: RespondRequestInput,
    adminId: string
  ) {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundError('Request not found');
    }

    // If linking a resource, verify it exists
    if (response.fulfilledResourceId) {
      const resource = await prisma.resource.findUnique({
        where: { id: response.fulfilledResourceId },
      });
      if (!resource) {
        throw new NotFoundError('Fulfilled resource not found');
      }
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      const updated = await tx.request.update({
        where: { id },
        data: {
          status: response.status,
          adminReply: response.adminReply,
          accessInstructions: response.accessInstructions,
          externalSourceUrl: response.externalSourceUrl,
          fulfilledResourceId: response.fulfilledResourceId,
          resolvedAt: new Date(),
        },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          fulfilledResource: {
            select: {
              id: true,
              title: true,
              accessType: true,
              physicalLocation: true,
            },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          entity: 'Request',
          entityId: id,
          action: 'RESPOND',
          performedById: adminId,
          meta: {
            status: response.status,
            hasAccessInstructions: !!response.accessInstructions,
            hasExternalSource: !!response.externalSourceUrl,
            fulfilledResourceId: response.fulfilledResourceId,
          },
        },
      });

      return updated;
    });

    // Build comprehensive email with access information
    let accessSection = '';
    if (response.accessInstructions) {
      accessSection += `<p><strong>Access Instructions:</strong> ${response.accessInstructions}</p>`;
    }
    if (response.externalSourceUrl) {
      accessSection += `<p><strong>External Source:</strong> <a href="${response.externalSourceUrl}">${response.externalSourceUrl}</a></p>`;
    }
    if ((updatedRequest as any).fulfilledResource) {
      const resource = (updatedRequest as any).fulfilledResource;
      accessSection += `<p><strong>Resource Available:</strong> ${resource.title}</p>`;
      if (resource.accessType === 'CAMPUS_ONLY' && resource.physicalLocation) {
        accessSection += `<p><strong>Location:</strong> ${resource.physicalLocation}</p>`;
      }
    }

    emailQueue.addGenericEmail({
      to: request.user.email,
      subject: `Request Update: ${request.title} - ${response.status}`,
      html: `
        <h1>Request ${response.status === 'RESOLVED' ? 'Fulfilled' : 'Update'}</h1>
        <p>Your resource request has been ${response.status.toLowerCase()}.</p>
        <p><strong>Title Requested:</strong> ${request.title}</p>
        <p><strong>Admin Response:</strong> ${response.adminReply}</p>
        ${accessSection}
        <p>Thank you for using the E-Library.</p>
      `,
    }).catch(err => {
      logger.warn('Failed to send request response email', { err });
    });

    logger.info('Request responded to', { requestId: id, adminId, status: response.status });

    return updatedRequest;
  }

  async delete(id: string, userId: string, isAdmin: boolean = false) {
    const request = await prisma.request.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundError('Request not found');
    }

    if (!isAdmin && request.userId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    if (!isAdmin && request.status !== 'OPEN') {
      throw new ForbiddenError('Cannot delete a request that is already being processed');
    }

    await prisma.$transaction(async (tx) => {
      await tx.request.delete({
        where: { id },
      });

      await tx.auditLog.create({
        data: {
          entity: 'Request',
          entityId: id,
          action: 'DELETE',
          performedById: userId,
          meta: { title: request.title },
        },
      });
    });

    logger.info('Request deleted', { requestId: id, userId });

    return { message: 'Request deleted successfully' };
  }

  async getStats() {
    const [byStatus, total, recent] = await Promise.all([
      prisma.request.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.request.count(),
      prisma.request.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      total,
      recent,
      byStatus: Object.fromEntries(
        byStatus.map(item => [item.status, item._count.status])
      ),
    };
  }
}

export const requestService = new RequestService();
