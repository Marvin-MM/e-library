import { Router } from 'express';
import { searchController } from './search.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { optionalAuth } from '../../shared/middleware/auth.js';
import { searchRateLimiter } from '../../shared/middleware/rateLimiter.js';
import { searchQuerySchema, searchSuggestionsSchema } from './search.validators.js';

const router = Router();

router.get(
  '/',
  searchRateLimiter,
  optionalAuth,
  validate(searchQuerySchema, 'query'),
  searchController.search.bind(searchController)
);

router.get(
  '/top-terms',
  searchController.getTopSearchTerms.bind(searchController)
);

router.get(
  '/suggestions',
  searchRateLimiter,
  validate(searchSuggestionsSchema, 'query'),
  searchController.getSuggestions.bind(searchController)
);

export default router;
