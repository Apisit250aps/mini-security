import { z } from 'zod';
import {
  BaseEntity,
  BooleanField,
  DateField,
  EmailField,
  StringField,
} from '#lib/entity';

export const userSchema = BaseEntity({
  name: StringField({ required: true }),
  email: EmailField({ required: true }),
  emailVerified: BooleanField({ default: () => false }),
  image: StringField({ required: false, nullable: true }),
  isAdmin: BooleanField({ default: () => false }),
  isActive: BooleanField({ default: () => true }),
  lastLogin: DateField({ required: false, nullable: true }),
});

export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateUserSchema = userSchema
  .partial()
  .omit({ id: true, createdAt: true, updatedAt: true });

export type UserEntity = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
