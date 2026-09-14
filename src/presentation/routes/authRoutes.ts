import { Router } from 'express';
import type { AuthController } from '../controllers/AuthController.js';

export const createAuthRoutes = (authController: AuthController): Router => {
  const router = Router();

  router.post('/register', authController.register);
  router.post('/login', authController.login);

  return router;
};
