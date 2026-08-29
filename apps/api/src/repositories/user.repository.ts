import db from '@repo/database/db';
import { UserRepository } from '@repo/infrastructures';

export const userRepository = new UserRepository(db);
