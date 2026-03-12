// src/modules/discovery/discovery.routes.ts
import { Router } from 'express';
import { discoveryController } from './discovery.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { discoverySearchSchema } from './discovery.validators.js';
import { authenticate } from '../../shared/middleware/auth.js';
import { searchRateLimiter } from '../../shared/middleware/rateLimiter.js';

const router = Router();

router.get(
  '/search',
  authenticate,
  searchRateLimiter,
  validate(discoverySearchSchema, 'query'),
  discoveryController.search.bind(discoveryController)
);

router.get('/sources', discoveryController.sources.bind(discoveryController));

export default router;