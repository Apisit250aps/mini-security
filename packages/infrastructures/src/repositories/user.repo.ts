import { eq } from 'drizzle-orm';
import type { Database } from '@repo/database/db';
import { Repository } from '@repo/database/repository';
import { user } from '@repo/database/schema';
import { User } from '@repo/domains/entities';
import type { IUserRepository } from '@repo/domains/repositories/user';
import type { CreateUser, UpdateUser } from '@repo/domains/schema/user';

export default class UserRepository
  extends Repository<User, CreateUser, UpdateUser>
  implements IUserRepository
{
  constructor(db: Database) {
    super(db, user);
  }

  override async create(entity: CreateUser): Promise<User> {
    const userData = { ...entity };
    delete (userData as { password?: string }).password;
    const [result] = await this.db
      .insert(this.table)
      .values(userData)
      .returning();
    return new User(result as unknown as User);
  }

  async findByEmail(email: string): Promise<User | null> {
    const [result] = await this.db
      .select()
      .from(this.table)
      .where(eq(user.email, email.toLowerCase().trim()));
    return result ? new User(result as unknown as User) : null;
  }

  async findAdmins(): Promise<User[]> {
    const results = await this.db
      .select()
      .from(this.table)
      .where(eq(user.isAdmin, true));
    return results.map((r) => new User(r as unknown as User));
  }

  async updateLastLogin(id: string, lastLogin: Date): Promise<User> {
    const [result] = await this.db
      .update(this.table)
      .set({ lastLogin })
      .where(eq(user.id, id))
      .returning();
    if (!result) {
      throw new Error(`User with id ${id} not found`);
    }
    return new User(result as unknown as User);
  }
}
