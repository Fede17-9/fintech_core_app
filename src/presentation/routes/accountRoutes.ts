import { Router } from 'express';
import type { AccountController } from '../controllers/AccountController.js';
import type { JwtTokenService } from '../../infrastructure/services/JwtTokenService.js';
import { createAuthMiddleware } from '../middleware/authMiddleware.js';

export const createAccountRoutes = (
  accountController: AccountController,
  tokenService: JwtTokenService,
): Router => {
  const router = Router();
  const authenticate = createAuthMiddleware(tokenService);

  router.use(authenticate);
  router.get('/', accountController.getUserAccounts);
  router.post('/', accountController.createAccount);
  router.get('/:accountId/balance', accountController.getBalance);
  router.patch('/:accountId/freeze', accountController.freeze);
  router.patch('/:accountId/unfreeze', accountController.unfreeze);

  return router;
};
