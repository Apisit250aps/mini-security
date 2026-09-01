import db from '@repo/database/db';
import {
  AccountRepository,
  CompanyMemberRepository,
  CompanyRepository,
  PermissionRepository,
  RolePermissionRepository,
  RoleRepository,
  SessionRepository,
  UserRepository,
} from '@repo/infrastructures';

export const userRepository = new UserRepository(db);

export const companyRepository = new CompanyRepository(db);
export const companyMemberRepository = new CompanyMemberRepository(db);

export const roleRepository = new RoleRepository(db);
export const permissionRepository = new PermissionRepository(db);
export const rolePermissionRepository = new RolePermissionRepository(db);

export const sessionRepository = new SessionRepository(db);
export const accountRepository = new AccountRepository(db);
