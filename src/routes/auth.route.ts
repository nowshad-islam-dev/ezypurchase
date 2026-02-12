import express from 'express';
import validate from '../middlewares/validate';
import { register, login, refreshTokens } from '../validations/auth.validation';
import { authController } from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', validate(register), authController.register);
router.post('/login', validate(login), authController.login);
router.post('/logout', validate(refreshTokens), authController.logout);
router.post(
  '/refresh-tokens',
  validate(refreshTokens),
  authController.refreshTokens,
);

export default router;
