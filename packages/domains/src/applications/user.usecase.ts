import type { BaseUseCase } from '../index';
import type { ISecurityContext } from '#constants/permissions';
import type { User } from '#entities/user';
import type { CreateUser, UpdateUser } from '#schema/user';

export type ICreateUserContext = ISecurityContext & { data: CreateUser };
export type IUpdateUserContext = ISecurityContext & {
  id: string;
  data: UpdateUser;
};
export type IDeleteUserContext = ISecurityContext & { id: string };
export type IGetUserContext = ISecurityContext & { id: string };
export type IGetUserByEmailContext = ISecurityContext & { email: string };
export type IGetUsersContext = ISecurityContext & {
  filter?: Record<string, unknown>;
};

export type ICreateUserUseCase = BaseUseCase<ICreateUserContext, User>;
export type IUpdateUserUseCase = BaseUseCase<IUpdateUserContext, User>;
export type IDeleteUserUseCase = BaseUseCase<IDeleteUserContext, void>;
export type IGetUserUseCase = BaseUseCase<IGetUserContext, User | null>;
export type IGetUserByEmailUseCase = BaseUseCase<
  IGetUserByEmailContext,
  User | null
>;
export type IGetUsersUseCase = BaseUseCase<IGetUsersContext | void, User[]>;
