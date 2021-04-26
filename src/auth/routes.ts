import { Router } from 'express';
import { authValidators } from './validators';
import { authController } from './controller';

export const authRoutes = Router();

authRoutes.post('/sign-up', authValidators.signUpValidator, authController.signUp);
authRoutes.post('/sign-in', authValidators.signInValidator, authController.signIn);
