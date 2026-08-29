import type {
  ICreateUserContext,
  ICreateUserUseCase,
  IDeleteUserContext,
  IDeleteUserUseCase,
  IGetUserByEmailContext,
  IGetUserByEmailUseCase,
  IGetUserContext,
  IGetUserUseCase,
  IGetUsersUseCase,
  IUpdateUserContext,
  IUpdateUserUseCase,
} from '@repo/domains/applications/user';
import type { User } from '@repo/domains/entities/user';
import type { IUserRepository } from '@repo/domains/repositories/user';
import { createUserSchema, updateUserSchema } from '@repo/domains/schema/user';
import { DuplicateError, NotFoundError, ValidationError } from '../lib/error';

export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(context: ICreateUserContext): Promise<User> {
    const parsed = await createUserSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError('Invalid user data', parsed.error.format());
    }

    const existing = await this.userRepository.findByEmail(parsed.data.email);
    if (existing) {
      throw new DuplicateError('User with this email already exists');
    }

    return this.userRepository.create(parsed.data);
  }
}

export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(context: IUpdateUserContext): Promise<User> {
    const existing = await this.userRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`User with id ${context.id} not found`);
    }

    const parsed = await updateUserSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update user data',
        parsed.error.format(),
      );
    }

    if (parsed.data.email && parsed.data.email !== existing.email) {
      const emailTaken = await this.userRepository.findByEmail(
        parsed.data.email,
      );
      if (emailTaken) {
        throw new DuplicateError('User with this email already exists');
      }
    }

    return this.userRepository.update(context.id, parsed.data);
  }
}

export class DeleteUserUseCase implements IDeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(context: IDeleteUserContext): Promise<void> {
    const existing = await this.userRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`User with id ${context.id} not found`);
    }

    await this.userRepository.delete(context.id);
  }
}

export class GetUserUseCase implements IGetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(context: IGetUserContext): Promise<User | null> {
    const user = await this.userRepository.findById(context.id);
    if (!user) {
      throw new NotFoundError(`User with id ${context.id} not found`);
    }
    return user;
  }
}

export class GetUserByEmailUseCase implements IGetUserByEmailUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(context: IGetUserByEmailContext): Promise<User | null> {
    const user = await this.userRepository.findByEmail(context.email);
    if (!user) {
      throw new NotFoundError(`User with email ${context.email} not found`);
    }
    return user;
  }
}

export class GetUsersUseCase implements IGetUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
