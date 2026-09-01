import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { Session } from '#entities/auth';
import type { User } from '#entities/user';

// Output Types
export type IAuthResponse = {
  user: User;
  session: Session;
};

// Context Types
export type ISignInEmailContext = ISecurityContext & {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
};

export type ISignUpEmailContext = ISecurityContext & {
  name: string;
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
};

export type ISocialLoginContext = ISecurityContext & {
  providerId: string;
  accountId: string;
  name: string;
  email: string;
  image?: string;
};

export type IValidateSessionContext = ISecurityContext & {
  token: string;
};

export type ISignOutContext = ISecurityContext & {
  token: string;
};

// Use Case Contracts
export type ISignInEmailUseCase = BaseUseCase<
  ISignInEmailContext,
  IAuthResponse
>;
export type ISignUpEmailUseCase = BaseUseCase<
  ISignUpEmailContext,
  IAuthResponse
>;
export type ISocialLoginUseCase = BaseUseCase<
  ISocialLoginContext,
  IAuthResponse
>;
export type IValidateSessionUseCase = BaseUseCase<
  IValidateSessionContext,
  IAuthResponse | null
>;
export type ISignOutUseCase = BaseUseCase<ISignOutContext, void>;
