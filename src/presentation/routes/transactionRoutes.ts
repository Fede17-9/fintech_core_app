import { Router } from 'express';
import type { JwtTokenService } from '../../infrastructure/services/JwtTokenService.js';
import type { TransactionController } from '../controllers/TransactionController.js';
import { createAuthMiddleware } from '../middleware/authMiddleware.js';

export const createTransactionRoutes = (
  transactionController: TransactionController,
  tokenService: JwtTokenService,
): Router => {
  const router = Router();
  router.use(createAuthMiddleware(tokenService));
  router.post('/transfer', transactionController.transfer);
  router.post('/deposit', transactionController.deposit);
  router.post('/withdrawal', transactionController.withdrawal);
  router.get('/history/:accountId', transactionController.history);
  return router;
};
