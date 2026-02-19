import prisma from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';
import { notificationsService } from '../notifications/notifications.service.js';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from '../../shared/errors/AppError.js';
import type {
  CreateBookInput,
  UpdateBookInput,
  BookQueryInput,
  BorrowInput,
  InventoryUpsertInput,
  BorrowRecordQueryInput,
  CreateCampusInput,
} from './catalog.validators.js';
const DEFAULT_BORROW_DAYS = 14;
export class CatalogService {
  // ─────────────────────────────────────────────────────────────────────────
  // Books: Public
  // ─────────────────────────────────────────────────────────────────────────
  async getBooks(query: BookQueryInput) {
    const { page, limit, search, campusId, availableOnly } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, any> = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    // Filter by campus availability
    if (campusId || availableOnly) {
      where.inventory = {
        some: {
          ...(campusId ? { campusId } : {}),
          ...(availableOnly ? { availableCopies: { gt: 0 } } : {}),
        },
      };
    }
    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          inventory: {
            include: { campus: true },
            orderBy: { campus: { name: 'asc' } },
          },
        },
      }),
    ]);
    return {
      data: books,
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
  async getBookById(id: string) {
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        inventory: {
          include: { campus: true },
          orderBy: { campus: { name: 'asc' } },
        },
      },
    });
    if (!book) throw new NotFoundError('Book not found');
    return book;
  }
  // ─────────────────────────────────────────────────────────────────────────
  // Borrowing: Auth users
  // ─────────────────────────────────────────────────────────────────────────
  async borrowBook(userId: string, input: BorrowInput) {
    const { bookId, campusId } = input;
    const record = await prisma.$transaction(async (tx) => {
      // 1. Get inventory (lock)
      const inventory = await tx.inventory.findUnique({
        where: { bookId_campusId: { bookId, campusId } },
        include: { book: true, campus: true },
      });
      if (!inventory) {
        throw new NotFoundError('This book is not available at the specified campus');
      }
      if (inventory.availableCopies <= 0) {
        throw new BadRequestError(
          'No copies available at this campus. You may submit a request if the book is unavailable.'
        );
      }
      // 2. Prevent duplicate active borrow of same book by same user
      const existing = await tx.borrowRecord.findFirst({
        where: { userId, bookId, status: 'ACTIVE' },
      });
      if (existing) {
        throw new ConflictError('You already have an active borrow of this book');
      }
      // 3. Decrement available copies
      await tx.inventory.update({
        where: { bookId_campusId: { bookId, campusId } },
        data: { availableCopies: { decrement: 1 } },
      });
      // 4. Create borrow record
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + DEFAULT_BORROW_DAYS);
      const borrow = await tx.borrowRecord.create({
        data: {
          userId,
          bookId,
          campusId,
          dueDate,
          status: 'ACTIVE',
        },
        include: {
          book: true,
          campus: true,
        },
      });
      return borrow;
    });
    // 5. Notify user
    try {
      await notificationsService.createNotification({
        userId,
        type: 'success',
        title: 'Book Borrowed Successfully',
        message: `You borrowed "${record.book.title}" from ${record.campus.name}. Due date: ${record.dueDate.toDateString()}.`,
        data: { borrowId: record.id, bookId, campusId, dueDate: record.dueDate.toISOString() },
      });
    } catch (err) {
      logger.warn('Failed to send borrow notification', { err });
    }
    logger.info('Book borrowed', { userId, bookId, campusId, dueDate: record.dueDate });
    return record;
  }
  async getMyBorrows(userId: string) {
    const records = await prisma.borrowRecord.findMany({
      where: { userId },
      orderBy: { borrowedAt: 'desc' },
      include: {
        book: true,
        campus: true,
        returnedBy: { select: { id: true, name: true } },
      },
    });
    const now = new Date();
    const enriched = records.map((r) => ({
      ...r,
      isOverdue: r.status === 'ACTIVE' && r.dueDate < now,
    }));
    return {
      active: enriched.filter((r) => r.status === 'ACTIVE'),
      returned: enriched.filter((r) => r.status === 'RETURNED'),
      overdue: enriched.filter((r) => r.status === 'OVERDUE'),
    };
  }
  // ─────────────────────────────────────────────────────────────────────────
  // Books: Admin / Staff CRUD
  // ─────────────────────────────────────────────────────────────────────────
  // Inside CatalogService class, perhaps under "Campus listing (public)"

async createCampus(data: CreateCampusInput, adminId: string) {
  const existing = await prisma.campus.findUnique({
    where: { code: data.code },
  });

  if (existing) {
    throw new ConflictError(`A campus with the code "${data.code}" already exists.`);
  }

  const campus = await prisma.$transaction(async (tx) => {
    const newCampus = await tx.campus.create({ data });
    
    // Assuming your auditLog schema accepts this structure based on createBook
    await tx.auditLog.create({
      data: {
        entity: 'Campus',
        entityId: newCampus.id,
        action: 'CREATE',
        performedById: adminId,
        meta: { name: newCampus.name, code: newCampus.code },
      },
    });
    
    return newCampus;
  });

  logger.info('Campus created', { campusId: campus.id, adminId });
  return campus;
}

  async createBook(data: CreateBookInput, adminId: string) {
    const book = await prisma.$transaction(async (tx) => {
      // Check ISBN uniqueness if provided
      if (data.isbn) {
        const existing = await tx.book.findUnique({ where: { isbn: data.isbn } });
        if (existing) throw new ConflictError(`A book with ISBN ${data.isbn} already exists`);
      }
      const newBook = await tx.book.create({ data });
      await tx.auditLog.create({
        data: {
          entity: 'Book',
          entityId: newBook.id,
          action: 'CREATE',
          performedById: adminId,
          meta: { title: newBook.title, author: newBook.author },
        },
      });
      return newBook;
    });
    logger.info('Physical book created', { bookId: book.id, adminId });
    return book;
  }
  async updateBook(id: string, data: UpdateBookInput, adminId: string) {
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Book not found');
    if (data.isbn && data.isbn !== existing.isbn) {
      const conflict = await prisma.book.findUnique({ where: { isbn: data.isbn } });
      if (conflict) throw new ConflictError(`A book with ISBN ${data.isbn} already exists`);
    }
    const book = await prisma.book.update({ where: { id }, data });
    await prisma.auditLog.create({
      data: {
        entity: 'Book',
        entityId: id,
        action: 'UPDATE',
        performedById: adminId,
        meta: data as any,
      },
    });
    return book;
  }
  async deleteBook(id: string, adminId: string) {
    const book = await prisma.book.findUnique({ where: { id } });
    if (!book) throw new NotFoundError('Book not found');
    const activeBorrows = await prisma.borrowRecord.count({
      where: { bookId: id, status: 'ACTIVE' },
    });
    if (activeBorrows > 0) {
      throw new BadRequestError(
        'Cannot delete book with active borrow records. Resolve all active borrows first.'
      );
    }
    await prisma.$transaction([
      prisma.inventory.deleteMany({ where: { bookId: id } }),
      prisma.book.delete({ where: { id } }),
      prisma.auditLog.create({
        data: {
          entity: 'Book',
          entityId: id,
          action: 'DELETE',
          performedById: adminId,
          meta: { title: book.title },
        },
      }),
    ]);
    return { message: 'Book deleted successfully' };
  }
  // ─────────────────────────────────────────────────────────────────────────
  // Inventory: Admin / Staff
  // ─────────────────────────────────────────────────────────────────────────
  async upsertInventory(data: InventoryUpsertInput, adminId: string) {
    const { bookId, campusId, totalCopies, shelfLocation } = data;
    // Validate book + campus exist
    const [book, campus] = await Promise.all([
      prisma.book.findUnique({ where: { id: bookId } }),
      prisma.campus.findUnique({ where: { id: campusId } }),
    ]);
    if (!book) throw new NotFoundError('Book not found');
    if (!campus) throw new NotFoundError('Campus not found');
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.inventory.findUnique({
        where: { bookId_campusId: { bookId, campusId } },
      });
      if (existing) {
        // Ensure totalCopies >= currently borrowed
        const borrowed = existing.totalCopies - existing.availableCopies;
        if (totalCopies < borrowed) {
          throw new BadRequestError(
            `Cannot set total copies to ${totalCopies}; ${borrowed} copies are currently borrowed.`
          );
        }
        const newAvailable = totalCopies - borrowed;
        return tx.inventory.update({
          where: { bookId_campusId: { bookId, campusId } },
          data: { totalCopies, availableCopies: newAvailable, shelfLocation },
          include: { book: true, campus: true },
        });
      } else {
        return tx.inventory.create({
          data: { bookId, campusId, totalCopies, availableCopies: totalCopies, shelfLocation },
          include: { book: true, campus: true },
        });
      }
    });
    await prisma.auditLog.create({
      data: {
        entity: 'Inventory',
        entityId: result.id,
        action: 'UPSERT',
        performedById: adminId,
        meta: { bookId, campusId, totalCopies, shelfLocation },
      },
    });
    return result;
  }
  // ─────────────────────────────────────────────────────────────────────────
  // Borrow Records: Admin / Staff
  // ─────────────────────────────────────────────────────────────────────────
  async getBorrowRecords(query: BorrowRecordQueryInput) {
    const { page, limit, status, overdue, campusId, userId, startDate, endDate } = query;
    const skip = (page - 1) * limit;
    const where: Record<string, any> = {};
    if (status) where.status = status;
    if (campusId) where.campusId = campusId;
    if (userId) where.userId = userId;
    if (overdue) {
      where.status = 'ACTIVE';
      where.dueDate = { lt: new Date() };
    }
    if (startDate || endDate) {
      where.borrowedAt = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }
    const [total, records] = await Promise.all([
      prisma.borrowRecord.count({ where }),
      prisma.borrowRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { borrowedAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          book: true,
          campus: true,
          returnedBy: { select: { id: true, name: true } },
        },
      }),
    ]);
    return {
      data: records,
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
  async processReturn(borrowId: string, librarianId: string) {
    const result = await prisma.$transaction(async (tx) => {
      const borrow = await tx.borrowRecord.findUnique({
        where: { id: borrowId },
        include: { book: true, campus: true, user: true },
      });
      if (!borrow) throw new NotFoundError('Borrow record not found');
      if (borrow.status === 'RETURNED') {
        throw new BadRequestError('This book has already been returned');
      }
      // Update borrow record
      const updated = await tx.borrowRecord.update({
        where: { id: borrowId },
        data: {
          status: 'RETURNED',
          returnedAt: new Date(),
          returnedById: librarianId,
        },
        include: { book: true, campus: true },
      });
      // Increment available copies
      await tx.inventory.update({
        where: { bookId_campusId: { bookId: borrow.bookId, campusId: borrow.campusId } },
        data: { availableCopies: { increment: 1 } },
      });
      return { updated, borrow };
    });
    // Notify user
    try {
      await notificationsService.createNotification({
        userId: result.borrow.userId,
        type: 'info',
        title: 'Book Returned',
        message: `"${result.borrow.book.title}" has been marked as returned. Thank you!`,
        data: { borrowId, bookId: result.borrow.bookId },
      });
    } catch (err) {
      logger.warn('Failed to send return notification', { err });
    }
    logger.info('Book return processed', { borrowId, librarianId });
    return result.updated;
  }
  // ─────────────────────────────────────────────────────────────────────────
  // Campus listing (public)
  // ─────────────────────────────────────────────────────────────────────────
  async getCampuses() {
    return prisma.campus.findMany({ orderBy: { name: 'asc' } });
  }
}
export const catalogService = new CatalogService();
