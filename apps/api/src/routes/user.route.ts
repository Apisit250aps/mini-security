import { Hono } from 'hono';
import {
  createUserUseCase,
  deleteUserUseCase,
  getUserByEmailUseCase,
  getUserUseCase,
  getUsersUseCase,
  updateUserUseCase,
} from '@repo/infrastructures/compositions';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middleware';

const userController = new UserController(
  createUserUseCase,
  updateUserUseCase,
  deleteUserUseCase,
  getUserUseCase,
  getUserByEmailUseCase,
  getUsersUseCase,
);

const userRoutes = new Hono();

userRoutes.use('*', authMiddleware);

userRoutes.get('/', userController.getUsers);
userRoutes.get('/:id', userController.getUser);
userRoutes.post('/', userController.createUser);
userRoutes.put('/:id', userController.updateUser);
userRoutes.delete('/:id', userController.deleteUser);

export default userRoutes;
