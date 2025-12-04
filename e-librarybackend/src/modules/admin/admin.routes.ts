import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { validate } from '../../shared/middleware/validate.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import {
  updateUserRoleSchema,
  userQuerySchema,
  auditLogQuerySchema,
  userIdSchema,
} from './admin.validators.js';

const router = Router();

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get(
  '/users',
  validate(userQuerySchema, 'query'),
  adminController.getUsers.bind(adminController)
);

router.get(
  '/users/:id',
  validate(userIdSchema, 'params'),
  adminController.getUserById.bind(adminController)
);

router.put(
  '/users/:id/role',
  validate(userIdSchema, 'params'),
  validate(updateUserRoleSchema),
  adminController.updateUserRole.bind(adminController)
);

router.delete(
  '/users/:id',
  validate(userIdSchema, 'params'),
  adminController.deleteUser.bind(adminController)
);

router.get(
  '/metrics',
  adminController.getMetrics.bind(adminController)
);

router.get(
  '/audit-logs',
  validate(auditLogQuerySchema, 'query'),
  adminController.getAuditLogs.bind(adminController)
);

export default router;
