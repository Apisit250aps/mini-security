import { Hono } from 'hono';
import {
  createUserUseCase,
  deleteUserUseCase,
  getUserByEmailUseCase,
  getUserUseCase,
  getUsersUseCase,
  updateUserUseCase,
} from '../applications/user.application';
import { UserController } from '../controllers/user.controller';

const userController = new UserController(
  createUserUseCase,
  updateUserUseCase,
  deleteUserUseCase,
  getUserUseCase,
  getUserByEmailUseCase,
  getUsersUseCase,
);

const userRoutes = new Hono();

userRoutes.get('/', userController.getUsers);
userRoutes.get('/:id', userController.getUser);
userRoutes.post('/', userController.createUser);
userRoutes.put('/:id', userController.updateUser);
userRoutes.delete('/:id', userController.deleteUser);

export default userRoutes;
