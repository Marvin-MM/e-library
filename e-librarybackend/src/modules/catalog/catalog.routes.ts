import { Router } from 'express';
import { catalogController } from './catalog.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import {
    bookQuerySchema,
    bookIdParamSchema,
    borrowSchema,
    borrowRecordQuerySchema,
    createBookSchema,
    updateBookSchema,
    inventoryUpsertSchema,
    borrowIdParamSchema,
    createCampusSchema,
} from './catalog.validators.js';

const router = Router();

// ── Public endpoints ────────────────────────────────────────────────────────

// GET /catalog/campuses — list all campuses (publicly accessible)
router.get('/campuses', catalogController.getCampuses.bind(catalogController));

// GET /catalog/books — paginated search with campus availability
router.get(
    '/books',
    validate(bookQuerySchema, 'query'),
    catalogController.getBooks.bind(catalogController)
);

// GET /catalog/books/:id — single book with per-campus inventory
router.get(
    '/books/:id',
    validate(bookIdParamSchema, 'params'),
    catalogController.getBookById.bind(catalogController)
);

// ── Authenticated user endpoints ────────────────────────────────────────────

// // POST /catalog/borrow — borrow a book
// router.post(
//     '/borrow',
//     authenticate,
//     validate(borrowSchema),
//     catalogController.borrowBook.bind(catalogController)
// );

// // GET /catalog/borrow/my — user's own borrow history
// router.get(
//     '/borrow/my',
//     authenticate,
//     catalogController.getMyBorrows.bind(catalogController)
// );

// ── Admin / Staff endpoints ─────────────────────────────────────────────────

router.post(
    '/campuses',
    authenticate,
    authorize('ADMIN'),
    validate(createCampusSchema),
    catalogController.createCampus.bind(catalogController)
);

// POST /catalog/books — create book
router.post(
    '/books',
    authenticate,
    authorize('ADMIN'),
    validate(createBookSchema),
    catalogController.createBook.bind(catalogController)
);

// PATCH /catalog/books/:id — update book metadata
router.patch(
    '/books/:id',
    authenticate,
    authorize('ADMIN'),
    validate(bookIdParamSchema, 'params'),
    validate(updateBookSchema),
    catalogController.updateBook.bind(catalogController)
);

// DELETE /catalog/books/:id — delete book (admin only)
router.delete(
    '/books/:id',
    authenticate,
    authorize('ADMIN'),
    validate(bookIdParamSchema, 'params'),
    catalogController.deleteBook.bind(catalogController)
);

// // PUT /catalog/inventory — upsert campus inventory
// router.put(
//     '/inventory',
//     authenticate,
//     authorize('ADMIN'),
//     validate(inventoryUpsertSchema),
//     catalogController.upsertInventory.bind(catalogController)
// );

// // GET /catalog/borrow-records — admin borrow records with filters
// router.get(
//     '/borrow-records',
//     authenticate,
//     authorize('ADMIN'),
//     validate(borrowRecordQuerySchema, 'query'),
//     catalogController.getBorrowRecords.bind(catalogController)
// );

// // POST /catalog/borrow-records/:id/return — process a return
// router.post(
//     '/borrow-records/:id/return',
//     authenticate,
//     authorize('ADMIN'),
//     validate(borrowIdParamSchema, 'params'),
//     catalogController.processReturn.bind(catalogController)
// );

export default router;
