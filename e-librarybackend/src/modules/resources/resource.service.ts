import prisma from '../../config/database.js';
import { uploadBuffer, generateDownloadUrl, deleteFile, UploadResult } from '../../config/cloudinary.js';
import { NotFoundError, ForbiddenError, BadRequestError } from '../../shared/errors/AppError.js';
import { logger } from '../../shared/utils/logger.js';
import { getRedisClient, isRedisConnected } from '../../config/redis.js';
import type { CreateResourceInput, UpdateResourceInput, ResourceQueryInput } from './resource.validators.js';

const CACHE_TTL = 300;

type AccessTypeValue = 'VIEW_ONLY' | 'DOWNLOADABLE';
type ResourceCategoryValue = 'BOOK' | 'JOURNAL' | 'PAPER' | 'MAGAZINE' | 'THESIS' | 'OTHER';
type SortByField = 'createdAt' | 'title' | 'downloadCount' | 'viewCount';

export class ResourceService {
  async create(
    data: CreateResourceInput,
    file: Express.Multer.File | undefined,
    coverImage: Express.Multer.File | undefined,
    uploadedById: string
  ) {
    let cloudinaryResult: UploadResult | null = null;
    let coverResult: UploadResult | null = null;

    if (file) {
      cloudinaryResult = await uploadBuffer(file.buffer, 'e-library/resources', {
        resource_type: 'auto',
        public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}`,
      });
    }

    if (coverImage) {
      coverResult = await uploadBuffer(coverImage.buffer, 'e-library/resources/covers', {
        resource_type: 'image',
        public_id: `${Date.now()}-cover-${coverImage.originalname.replace(/\.[^/.]+$/, '')}`,
      });
    }

    const resource = await prisma.$transaction(async (tx) => {
      const newResource = await tx.resource.create({
        data: {
          title: data.title,
          authors: data.authors,
          description: data.description,
          category: data.category as ResourceCategoryValue,
          department: data.department,
          publicationYear: data.publicationYear,
          accessType: (data.accessType || 'DOWNLOADABLE') as AccessTypeValue,
          tags: data.tags || [],
          uploadedById,
          cloudinaryId: cloudinaryResult?.publicId,
          cloudinaryUrl: cloudinaryResult?.secureUrl,
          coverImageId: coverResult?.publicId,
          coverImageUrl: coverResult?.secureUrl,
          fileType: file?.mimetype,
          fileSize: file?.size,
        },
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (data.courseIds && data.courseIds.length > 0) {
        await tx.courseResource.createMany({
          data: data.courseIds.map((courseId) => ({
            courseId,
            resourceId: newResource.id,
          })),
          skipDuplicates: true,
        });
      }

      await tx.auditLog.create({
        data: {
          entity: 'Resource',
          entityId: newResource.id,
          action: 'CREATE',
          performedById: uploadedById,
          meta: { title: newResource.title },
        },
      });

      return newResource;
    });

    await this.invalidateCache();

    logger.info('Resource created', { resourceId: resource.id, title: resource.title });

    return resource;
  }

  async findById(id: string) {
    const resource = await prisma.resource.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
        courses: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    return resource;
  }

  async findAll(query: ResourceQueryInput) {
    const rawPage = (query as any).page ?? 1;
    const rawLimit = (query as any).limit ?? 20;

    const page = Number.isFinite(Number(rawPage)) && Number(rawPage) > 0
      ? Math.floor(Number(rawPage))
      : 1;
    const limit = Number.isFinite(Number(rawLimit)) && Number(rawLimit) > 0
      ? Math.floor(Number(rawLimit))
      : 20;

    const { cursor, search, category, department, year, tag, author, accessType } = query;

    const sortBy = (query as any).sortBy ?? 'createdAt';
    const sortOrder = (query as any).sortOrder ?? 'desc';

    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (category) where.category = category;
    if (department) where.department = { contains: department, mode: 'insensitive' };
    if (year) where.publicationYear = year;
    if (tag) where.tags = { has: tag };
    if (author) where.authors = { has: author };
    if (accessType) where.accessType = accessType;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Record<string, string> = {
      [sortBy as SortByField]: sortOrder,
    };

    if (cursor) {
      const [resources, total] = await Promise.all([
        prisma.resource.findMany({
          where: where as any,
          take: limit + 1,
          cursor: { id: cursor },
          skip: 1,
          orderBy: orderBy as any,
          include: {
            uploadedBy: {
              select: { id: true, name: true },
            },
          },
        }),
        prisma.resource.count({ where: where as any }),
      ]);

      const hasMore = resources.length > limit;
      const data = hasMore ? resources.slice(0, -1) : resources;
      const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

      return {
        data,
        pagination: {
          nextCursor,
          hasMore,
          total,
        },
      };
    }

    const skip = (page - 1) * limit;

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where: where as any,
        take: limit,
        skip,
        orderBy: orderBy as any,
        include: {
          uploadedBy: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.resource.count({ where: where as any }),
    ]);

    return {
      data: resources,
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

  async update(id: string, data: UpdateResourceInput, userId: string) {
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    const { courseIds, ...updateData } = data;

    const updatedResource = await prisma.$transaction(async (tx) => {
      const updated = await tx.resource.update({
        where: { id },
        data: updateData as any,
        include: {
          uploadedBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (courseIds !== undefined) {
        await tx.courseResource.deleteMany({
          where: { resourceId: id },
        });

        if (courseIds.length > 0) {
          await tx.courseResource.createMany({
            data: courseIds.map((courseId) => ({
              courseId,
              resourceId: id,
            })),
            skipDuplicates: true,
          });
        }
      }

      await tx.auditLog.create({
        data: {
          entity: 'Resource',
          entityId: id,
          action: 'UPDATE',
          performedById: userId,
          meta: { changes: data },
        },
      });

      return updated;
    });

    await this.invalidateCache();

    logger.info('Resource updated', { resourceId: id });

    return updatedResource;
  }

  async delete(id: string, userId: string) {
    const resource = await prisma.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    await prisma.$transaction(async (tx) => {
      if (resource.cloudinaryId) {
        try {
          await deleteFile(resource.cloudinaryId, 'raw');
        } catch (error) {
          logger.error('Failed to delete file from Cloudinary', { resourceId: id, error });
        }
      }

      if (resource.coverImageId) {
        try {
          await deleteFile(resource.coverImageId, 'image');
        } catch (error) {
          logger.error('Failed to delete cover image from Cloudinary', { resourceId: id, error });
        }
      }

      await tx.resource.delete({
        where: { id },
      });

      await tx.auditLog.create({
        data: {
          entity: 'Resource',
          entityId: id,
          action: 'DELETE',
          performedById: userId,
          meta: { title: resource.title },
        },
      });
    });

    await this.invalidateCache();

    logger.info('Resource deleted', { resourceId: id });

    return { message: 'Resource deleted successfully' };
  }

  async getDownloadUrl(resourceId: string, userId: string, ipAddress?: string, userAgent?: string) {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    if (!resource.cloudinaryId) {
      throw new BadRequestError('This resource does not have a downloadable file');
    }

    if (resource.accessType === 'VIEW_ONLY') {
      throw new ForbiddenError('This resource is view-only and cannot be downloaded');
    }

    await prisma.$transaction([
      prisma.downloadLog.create({
        data: {
          userId,
          resourceId,
          ipAddress,
          userAgent,
        },
      }),
      prisma.resource.update({
        where: { id: resourceId },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);

    const signedUrl = generateDownloadUrl(resource.cloudinaryId, {
      expiresInSeconds: 3600,
      resourceType: 'raw',
      filename: resource.title,
    });

    logger.info('Download URL generated', { resourceId, userId });

    return {
      url: signedUrl,
      expiresIn: 3600,
    };
  }

  async getPreviewUrl(resourceId: string, userId?: string) {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundError('Resource not found');
    }

    if (!resource.cloudinaryId) {
      throw new BadRequestError('This resource does not have a file');
    }

    await prisma.resource.update({
      where: { id: resourceId },
      data: { viewCount: { increment: 1 } },
    });

    const previewUrl = generateDownloadUrl(resource.cloudinaryId, {
      expiresInSeconds: 1800,
      resourceType: 'raw',
    });

    logger.info('Preview URL generated', { resourceId, userId });

    return {
      url: previewUrl,
      expiresIn: 1800,
    };
  }

  async getTrending(limit: number = 10) {
    const cacheKey = `trending:${limit}`;

    if (isRedisConnected()) {
      const cached = await getRedisClient().get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const resources = await prisma.resource.findMany({
      where: { isActive: true },
      orderBy: [
        { downloadCount: 'desc' },
        { viewCount: 'desc' },
      ],
      take: limit,
      select: {
        id: true,
        title: true,
        authors: true,
        category: true,
        department: true,
        downloadCount: true,
        viewCount: true,
        createdAt: true,
      },
    });

    if (isRedisConnected()) {
      await getRedisClient().setex(cacheKey, CACHE_TTL, JSON.stringify(resources));
    }

    return resources;
  }

  async getLatest(limit: number = 10) {
    const cacheKey = `latest:${limit}`;

    if (isRedisConnected()) {
      const cached = await getRedisClient().get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const resources = await prisma.resource.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        authors: true,
        category: true,
        department: true,
        createdAt: true,
      },
    });

    if (isRedisConnected()) {
      await getRedisClient().setex(cacheKey, CACHE_TTL, JSON.stringify(resources));
    }

    return resources;
  }

  private async invalidateCache() {
    if (isRedisConnected()) {
      const keys = await getRedisClient().keys('trending:*');
      const latestKeys = await getRedisClient().keys('latest:*');
      const searchKeys = await getRedisClient().keys('search:*');
      const allKeys = [...keys, ...latestKeys, ...searchKeys];
      
      if (allKeys.length > 0) {
        await getRedisClient().del(...allKeys);
      }
    }
  }
}

export const resourceService = new ResourceService();
