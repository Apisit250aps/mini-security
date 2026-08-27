import type { BaseUseCase } from '../index';
import type { Account, Session } from '#entities/auth';
import type { User } from '#entities/user';
import type { CreateAccount, CreateSession } from '#schema/auth';

// Context Types
export type ISignInEmailContext = {
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
};

export type ISignUpEmailContext = {
  name: string;
  email: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
};

export type ISocialLoginContext = {
  providerId: string;
  accountId: string;
  email: string;
  name: string;
  image?: string;
  accessToken?: string;
  refreshToken?: string;
  idToken?: string;
  accessTokenExpiresAt?: Date;
  refreshTokenExpiresAt?: Date;
  scope?: string;
  ipAddress?: string;
  userAgent?: string;
};

export type ISignOutContext = { token: string };
export type IValidateSessionContext = { token: string };
export type ICreateSessionContext = { data: CreateSession };
export type ILinkAccountContext = { data: CreateAccount };

export type IAuthResponse = {
  user: User;
  session: Session;
  account?: Account;
};

// Use Case Contracts
export type ISignInEmailUseCase = BaseUseCase<ISignInEmailContext, IAuthResponse>;
export type ISignUpEmailUseCase = BaseUseCase<ISignUpEmailContext, IAuthResponse>;
export type ISocialLoginUseCase = BaseUseCase<ISocialLoginContext, IAuthResponse>;
export type ISignOutUseCase = BaseUseCase<ISignOutContext, void>;
export type IValidateSessionUseCase = BaseUseCase<
  IValidateSessionContext,
  IAuthResponse | null
>;
