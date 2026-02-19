import { Response, NextFunction } from 'express';
import { catalogService } from './catalog.service.js';
import { AuthenticatedRequest } from '../../shared/types/index.js';
export class CatalogController {
  // ── Public ─────────────────────────────────────────────────────────────
  async getBooks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req as any).validated?.query ?? req.query;
      const result = await catalogService.getBooks(query as any);
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
  async getBookById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const book = await catalogService.getBookById(req.params.id);
      res.json({ success: true, data: book });
    } catch (error) {
      next(error);
    }
  }
  async getCampuses(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const campuses = await catalogService.getCampuses();
      res.json({ success: true, data: campuses });
    } catch (error) {
      next(error);
    }
  }
  // ── Auth users ─────────────────────────────────────────────────────────
  async borrowBook(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await catalogService.borrowBook(req.user!.userId, req.body);
      res.status(201).json({ success: true, message: 'Book borrowed successfully', data: record });
    } catch (error) {
      next(error);
    }
  }
  async getMyBorrows(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const borrows = await catalogService.getMyBorrows(req.user!.userId);
      res.json({ success: true, data: borrows });
    } catch (error) {
      next(error);
    }
  }
  // ── Admin / Staff ──────────────────────────────────────────────────────
  // Inside CatalogController class, preferably under the Admin / Staff section

async createCampus(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const campus = await catalogService.createCampus(req.body, req.user!.userId);
    res.status(201).json({ 
      success: true, 
      message: 'Campus created successfully', 
      data: campus 
    });
  } catch (error) {
    next(error);
  }
}

  async createBook(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const book = await catalogService.createBook(req.body, req.user!.userId);
      res.status(201).json({ success: true, message: 'Book created successfully', data: book });
    } catch (error) {
      next(error);
    }
  }
  async updateBook(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const book = await catalogService.updateBook(req.params.id, req.body, req.user!.userId);
      res.json({ success: true, message: 'Book updated successfully', data: book });
    } catch (error) {
      next(error);
    }
  }
  async deleteBook(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await catalogService.deleteBook(req.params.id, req.user!.userId);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }
  async upsertInventory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const inventory = await catalogService.upsertInventory(req.body, req.user!.userId);
      res.json({ success: true, message: 'Inventory updated successfully', data: inventory });
    } catch (error) {
      next(error);
    }
  }
  async getBorrowRecords(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req as any).validated?.query ?? req.query;
      const result = await catalogService.getBorrowRecords(query as any);
      res.json({ success: true, data: result.data, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
  async processReturn(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await catalogService.processReturn(req.params.id, req.user!.userId);
      res.json({ success: true, message: 'Book return processed successfully', data: record });
    } catch (error) {
      next(error);
    }
  }
}
export const catalogController = new CatalogController();
