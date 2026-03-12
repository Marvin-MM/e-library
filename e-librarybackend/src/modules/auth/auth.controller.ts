import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { AuthenticatedRequest } from '../../shared/types/index.js';

export class AuthController {
  async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = (req as any).validated?.body ?? req.body;
      const user = await authService.signup(body);
      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = (req as any).validated?.body ?? req.body;
      const result = await authService.login(body, req.ip, req.headers['user-agent']);
      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = (req as any).validated?.body ?? req.body;
      const { refreshToken } = body;
      const result = await authService.refreshTokens(refreshToken);
      res.json({
        success: true,
        message: 'Tokens refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const accessToken = req.headers.authorization?.split(' ')[1] || '';
      const { refreshToken } = req.body || {};
      await authService.logout(req.user!.userId, accessToken, refreshToken);
      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = (req as any).validated?.body ?? req.body;
      const { token } = body;
      const result = await authService.verifyEmail(token);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = (req as any).validated?.body ?? req.body;
      const result = await authService.forgotPassword(body);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = (req as any).validated?.body ?? req.body;
      const result = await authService.resetPassword(body);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.getProfile(req.user!.userId);
      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = (req as any).validated?.body ?? req.body;
      const user = await authService.updateProfile(req.user!.userId, body);
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = (req as any).validated?.body ?? req.body;
      const { currentPassword, newPassword } = body;
      const result = await authService.changePassword(req.user!.userId, currentPassword, newPassword);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async resendVerification(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = (req as any).validated?.body ?? req.body;
      const { email } = body;
      const result = await authService.resendVerificationEmail(email);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
