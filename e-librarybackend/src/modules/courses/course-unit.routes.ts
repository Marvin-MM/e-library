// src/modules/courses/course-unit.routes.ts
import { Router, Response, NextFunction } from 'express';
import { courseUnitService } from './course-unit.service.js';
import { authenticate, authorize } from '../../shared/middleware/auth.js';
import { validate } from '../../shared/middleware/validate.js';
import { AuthenticatedRequest } from '../../shared/types/index.js';
import { createCourseUnitSchema, updateCourseUnitSchema, courseUnitQuerySchema, courseUnitParamsSchema } from './course-unit.validators.js';

const router = Router();

/**
 * GET /courses/:courseId/units
 * Get all units for a course (public)
 */
router.get(
    '/:courseId/units',
    validate(courseUnitParamsSchema, 'params'),
    validate(courseUnitQuerySchema, 'query'),
    async (req: any, res, next) => {
        try {
            const result = await courseUnitService.findByCourse(req.params.courseId, req.validated.query);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /courses/units/:unitId
 * Get a specific course unit with its resources
 */
router.get(
    '/units/:unitId',
    validate(courseUnitParamsSchema, 'params'),
    async (req, res, next) => {
        try {
            const unit = await courseUnitService.findById(req.params.unitId);
            res.json({ success: true, data: unit });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * GET /courses/units/:unitId/resources
 * Get resources for a specific course unit
 */
router.get(
    '/units/:unitId/resources',
    validate(courseUnitParamsSchema, 'params'),
    validate(courseUnitQuerySchema, 'query'),
    async (req: any, res, next) => {
        try {
            const result = await courseUnitService.getResources(req.params.unitId, req.validated.query);
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * POST /courses/:courseId/units
 * Create a new course unit (staff/admin only)
 */
router.post(
    '/:courseId/units',
    authenticate,
    authorize('STAFF', 'ADMIN'),
    validate(courseUnitParamsSchema, 'params'),
    validate(createCourseUnitSchema, 'body'),
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const unit = await courseUnitService.create(
                req.params.courseId,
                req.validated.body,
                req.user!.userId
            );
            res.status(201).json({
                success: true,
                message: 'Course unit created successfully',
                data: unit,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * PUT /courses/units/:unitId
 * Update a course unit (staff/admin only)
 */
router.put(
    '/units/:unitId',
    authenticate,
    authorize('STAFF', 'ADMIN'),
    validate(courseUnitParamsSchema, 'params'),
    validate(updateCourseUnitSchema, 'body'),
    async (req: any, res: Response, next: NextFunction) => {
        try {
            const unit = await courseUnitService.update(
                req.params.unitId,
                req.validated.body,
                req.user!.userId
            );
            res.json({
                success: true,
                message: 'Course unit updated successfully',
                data: unit,
            });
        } catch (error) {
            next(error);
        }
    }
);

/**
 * DELETE /courses/units/:unitId
 * Delete a course unit (admin only)
 */
router.delete(
    '/units/:unitId',
    authenticate,
    authorize('ADMIN'),
    validate(courseUnitParamsSchema, 'params'),
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const result = await courseUnitService.delete(
                req.params.unitId,
                req.user!.userId
            );
            res.json({ success: true, message: result.message });
        } catch (error) {
            next(error);
        }
    }
);

export default router;
