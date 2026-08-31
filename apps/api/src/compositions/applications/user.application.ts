import { hash } from '@repo/infrastructures';
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserByEmailUseCase,
  GetUserUseCase,
  GetUsersUseCase,
  UpdateUserUseCase,
} from '@repo/applications';
import { accountRepository, userRepository } from '../repositories';

export const createUserUseCase = new CreateUserUseCase(
  userRepository,
  accountRepository,
  hash,
);
export const updateUserUseCase = new UpdateUserUseCase(userRepository);
export const deleteUserUseCase = new DeleteUserUseCase(userRepository);
export const getUserUseCase = new GetUserUseCase(userRepository);
export const getUserByEmailUseCase = new GetUserByEmailUseCase(userRepository);
export const getUsersUseCase = new GetUsersUseCase(userRepository);
