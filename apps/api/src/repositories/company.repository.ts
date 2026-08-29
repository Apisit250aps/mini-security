import db from '@repo/database/db';
import {
  CompanyMemberRepository,
  CompanyRepository,
} from '@repo/infrastructures';

export const companyRepository = new CompanyRepository(db);
export const companyMemberRepository = new CompanyMemberRepository(db);
