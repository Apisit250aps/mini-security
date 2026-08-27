import type { BaseUseCase } from '../index';
import type { User } from '#entities/user';
import type { CreateUser, UpdateUser } from '#schema/user';

export type ICreateUserContext = { data: CreateUser };
export type IUpdateUserContext = { id: string; data: UpdateUser };
export type IDeleteUserContext = { id: string };
export type IGetUserContext = { id: string };
export type IGetUserByEmailContext = { email: string };
export type IGetUsersContext = { filter?: Record<string, unknown> };

export type ICreateUserUseCase = BaseUseCase<ICreateUserContext, User>;
export type IUpdateUserUseCase = BaseUseCase<IUpdateUserContext, User>;
export type IDeleteUserUseCase = BaseUseCase<IDeleteUserContext, void>;
export type IGetUserUseCase = BaseUseCase<IGetUserContext, User | null>;
export type IGetUserByEmailUseCase = BaseUseCase<
  IGetUserByEmailContext,
  User | null
>;
export type IGetUsersUseCase = BaseUseCase<IGetUsersContext, User[]>;
