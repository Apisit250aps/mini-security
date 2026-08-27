import type { BaseRepository } from '../index';
import type { Account, Session, Verification } from '#entities/auth';
import type {
  CreateAccount,
  CreateSession,
  CreateVerification,
  UpdateAccount,
  UpdateSession,
  UpdateVerification,
} from '#schema/auth';

export interface ISessionRepository
  extends BaseRepository<Session, CreateSession, UpdateSession> {
  findByToken(token: string): Promise<Session | null>;
  deleteByToken(token: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

export interface IAccountRepository
  extends BaseRepository<Account, CreateAccount, UpdateAccount> {
  findByProvider(
    providerId: string,
    accountId: string,
  ): Promise<Account | null>;
  findByUserId(userId: string): Promise<Account[]>;
  findByUserIdAndProvider(
    userId: string,
    providerId: string,
  ): Promise<Account | null>;
}

export interface IVerificationRepository
  extends BaseRepository<Verification, CreateVerification, UpdateVerification> {
  findByIdentifier(identifier: string): Promise<Verification | null>;
  deleteByIdentifier(identifier: string): Promise<void>;
}
