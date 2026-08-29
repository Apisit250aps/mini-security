import db from '@repo/database/db';
import { AccountRepository, SessionRepository } from '@repo/infrastructures';

export const sessionRepository = new SessionRepository(db);
export const accountRepository = new AccountRepository(db);
