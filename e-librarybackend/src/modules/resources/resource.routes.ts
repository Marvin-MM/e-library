// import { Router } from 'express';
// import multer from 'multer';
// import { resourceController } from './resource.controller.js';
// import { validate } from '../../shared/middleware/validate.js';
// import { authenticate, authorize, optionalAuth } from '../../shared/middleware/auth.js';
// import { downloadRateLimiter, searchRateLimiter } from '../../shared/middleware/rateLimiter.js';
// import {
//   createResourceSchema,
//   updateResourceSchema,
//   resourceQuerySchema,
//   resourceIdSchema,
// } from './resource.validators.js';

// const router = Router();

// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 50 * 1024 * 1024,
//   },
//   fileFilter: (_req, file, cb) => {
//     const allowedMimes = [
//       'application/pdf',
//       'application/epub+zip',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       'application/vnd.ms-powerpoint',
//       'application/vnd.openxmlformats-officedocument.presentationml.presentation',
//     ];

//     if (allowedMimes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type. Only PDF, EPUB, DOC, DOCX, PPT, and PPTX files are allowed.'));
//     }
//   },
// });

// router.get(
//   '/trending',
//   resourceController.getTrending.bind(resourceController)
// );

// router.get(
//   '/latest',
//   resourceController.getLatest.bind(resourceController)
// );

// router.get(
//   '/',
//   searchRateLimiter,
//   optionalAuth,
//   validate(resourceQuerySchema, 'query'),
//   resourceController.findAll.bind(resourceController)
// );

// router.get(
//   '/:id',
//   validate(resourceIdSchema, 'params'),
//   resourceController.findById.bind(resourceController)
// );

// router.post(
//   '/',
//   authenticate,
//   authorize('STAFF', 'ADMIN'),
//   upload.single('file'),
//   validate(createResourceSchema),
//   resourceController.create.bind(resourceController)
// );

// router.put(
//   '/:id',
//   authenticate,
//   authorize('STAFF', 'ADMIN'),
//   validate(resourceIdSchema, 'params'),
//   validate(updateResourceSchema),
//   resourceController.update.bind(resourceController)
// );

// router.delete(
//   '/:id',
//   authenticate,
//   authorize('ADMIN'),
//   validate(resourceIdSchema, 'params'),
//   resourceController.delete.bind(resourceController)
// );

// router.post(
//   '/:id/download',
//   authenticate,
//   downloadRateLimiter,
//   validate(resourceIdSchema, 'params'),
//   resourceController.download.bind(resourceController)
// );

// router.get(
//   '/:id/preview',
//   optionalAuth,
//   validate(resourceIdSchema, 'params'),
//   resourceController.preview.bind(resourceController)
// );

// export default router;

// resource.routes.js (or wherever your routes are)
import { Router } from 'express';
import multer from 'multer';
import { resourceController } from './resource.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate, authorize, optionalAuth } from '../../shared/middleware/auth.js';
import { downloadRateLimiter, searchRateLimiter } from '../../shared/middleware/rateLimiter.js';
import {
  createResourceSchema,
  updateResourceSchema,
  resourceQuerySchema,
  resourceIdSchema,
} from './resource.validators.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const documentMimes = [
      'application/pdf',
      'application/epub+zip',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];

    const imageMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ];

    if (file.fieldname === 'coverImage') {
      // Allow common image types for cover images
      if (imageMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid cover image type. Only common image formats (JPEG, PNG, WebP, GIF, SVG) are allowed.'));
      }
      return;
    }

    // Default behavior for main resource file
    if (documentMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, EPUB, DOC, DOCX, PPT, and PPTX files are allowed.'));
    }
  },
});

// Custom middleware to parse FormData fields
const parseFormData = (req: any, res: any, next: any) => {
  if (req.is('multipart/form-data')) {
    // Parse JSON strings in FormData
    const parsedBody: any = {};
    
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        // Try to parse as JSON if it looks like JSON
        if (value.trim().startsWith('[') || value.trim().startsWith('{')) {
          try {
            parsedBody[key] = JSON.parse(value);
          } catch {
            parsedBody[key] = value;
          }
        } else {
          parsedBody[key] = value;
        }
      } else {
        parsedBody[key] = value;
      }
    }
    
    // Convert publicationYear to number if present
    if (parsedBody.publicationYear) {
      parsedBody.publicationYear = Number(parsedBody.publicationYear);
    }
    
    req.body = parsedBody;
  }
  next();
};

router.get(
  '/trending',
  resourceController.getTrending.bind(resourceController)
);

router.get(
  '/latest',
  resourceController.getLatest.bind(resourceController)
);

router.get(
  '/',
  searchRateLimiter,
  optionalAuth,
  validate(resourceQuerySchema, 'query'),
  resourceController.findAll.bind(resourceController)
);

router.get(
  '/:id',
  validate(resourceIdSchema, 'params'),
  resourceController.findById.bind(resourceController)
);

router.post(
  '/',
  authenticate,
  authorize('STAFF', 'ADMIN'),
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 },
  ]),
  parseFormData, // Add this middleware before validation
  validate(createResourceSchema),
  resourceController.create.bind(resourceController)
);

router.put(
  '/:id',
  authenticate,
  authorize('STAFF', 'ADMIN'),
  validate(resourceIdSchema, 'params'),
  validate(updateResourceSchema),
  resourceController.update.bind(resourceController)
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(resourceIdSchema, 'params'),
  resourceController.delete.bind(resourceController)
);

router.post(
  '/:id/download',
  authenticate,
  downloadRateLimiter,
  validate(resourceIdSchema, 'params'),
  resourceController.download.bind(resourceController)
);

router.get(
  '/:id/preview',
  optionalAuth,
  validate(resourceIdSchema, 'params'),
  resourceController.preview.bind(resourceController)
);

export default router;