import type { BaseRepository } from '../index';
import type { User } from '#entities/user';
import type { CreateUser, UpdateUser } from '#schema/user';

export interface IUserRepository
  extends BaseRepository<User, CreateUser, UpdateUser> {
  findByEmail(email: string): Promise<User | null>;
  findAdmins(): Promise<User[]>;
  updateLastLogin(id: string, lastLogin: Date): Promise<User>;
}
