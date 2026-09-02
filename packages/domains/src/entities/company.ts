import type {
  CompanyBranchEntity,
  CompanyEntity,
  CompanyMemberEntity,
} from '#schema/company';

export class Company implements CompanyEntity {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: CompanyEntity) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.logo = data.logo;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class CompanyBranch implements CompanyBranchEntity {
  id: string;
  companyId: string;
  name: string;
  address?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: CompanyBranchEntity) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.name = data.name;
    this.address = data.address;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class CompanyMember implements CompanyMemberEntity {
  id: string;
  companyBranchId: string;
  companyId: string;
  userId: string;
  roleId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: CompanyMemberEntity) {
    this.id = data.id;
    this.companyBranchId = data.companyBranchId;
    this.companyId = data.companyId;
    this.userId = data.userId;
    this.roleId = data.roleId;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
