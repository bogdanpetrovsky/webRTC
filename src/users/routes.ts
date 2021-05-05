import { Router } from 'express';
import { usersValidators } from './validators';
import { usersController } from './controller'

export const usersRoutes = Router();

usersRoutes.get('/interests-search', usersValidators.search, usersController.search);
usersRoutes.get('/:id', usersValidators.getValidator, usersController.getById);
usersRoutes.get('', usersValidators.getUsersValidator, usersController.getAllUsers);
usersRoutes.patch('/:id', usersValidators.updateValidator, usersController.update);
