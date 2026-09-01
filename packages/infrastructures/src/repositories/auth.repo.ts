import { and, eq } from 'drizzle-orm';
import type { Database } from '@repo/database/db';
import { Repository } from '@repo/database/repository';
import { account, session, verification } from '@repo/database/schema';
import { Account, Session, Verification } from '@repo/domains/entities';
import type {
  IAccountRepository,
  ISessionRepository,
  IVerificationRepository,
} from '@repo/domains/repositories/auth';
import type {
  CreateAccount,
  CreateSession,
  CreateVerification,
  UpdateAccount,
  UpdateSession,
  UpdateVerification,
} from '@repo/domains/schema/auth';

export class SessionRepository
  extends Repository<Session, CreateSession, UpdateSession>
  implements ISessionRepository
{
  constructor(db: Database) {
    super(db, session);
  }

  async findByToken(token: string): Promise<Session | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(eq(session.token, token));
    return result ? new Session(result as unknown as Session) : null;
  }

  async deleteByToken(token: string): Promise<void> {
    await this.db.delete(this.table).where(eq(session.token, token));
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.db.delete(this.table).where(eq(session.userId, userId));
  }
}

export class AccountRepository
  extends Repository<Account, CreateAccount, UpdateAccount>
  implements IAccountRepository
{
  constructor(db: Database) {
    super(db, account);
  }

  async findByProvider(
    providerId: string,
    accountId: string,
  ): Promise<Account | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(
        and(
          eq(account.providerId, providerId),
          eq(account.accountId, accountId),
        ),
      );
    return result ? new Account(result as unknown as Account) : null;
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(account.userId, userId));
    return results.map((r) => new Account(r as unknown as Account));
  }

  async findByUserIdAndProvider(
    userId: string,
    providerId: string,
  ): Promise<Account | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(
        and(eq(account.userId, userId), eq(account.providerId, providerId)),
      );
    return result ? new Account(result as unknown as Account) : null;
  }
}

export class VerificationRepository
  extends Repository<Verification, CreateVerification, UpdateVerification>
  implements IVerificationRepository
{
  constructor(db: Database) {
    super(db, verification);
  }

  async findByIdentifier(identifier: string): Promise<Verification | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(eq(verification.identifier, identifier));
    return result ? new Verification(result as unknown as Verification) : null;
  }

  async deleteByIdentifier(identifier: string): Promise<void> {
    await this.db
      .delete(this.table)
      .where(eq(verification.identifier, identifier));
  }
}
