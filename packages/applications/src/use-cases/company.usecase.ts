/* eslint-disable @typescript-eslint/no-unused-vars */
import { PERMISSIONS } from '@repo/domains/constants';
import type {
  IAddCompanyMemberContext,
  IAddCompanyMemberUseCase,
  ICreateCompanyContext,
  ICreateCompanyUseCase,
  IDeleteCompanyContext,
  IDeleteCompanyUseCase,
  IGetCompaniesContext,
  IGetCompaniesUseCase,
  IGetCompanyBySlugContext,
  IGetCompanyBySlugUseCase,
  IGetCompanyContext,
  IGetCompanyMembersContext,
  IGetCompanyMembersUseCase,
  IGetCompanyUseCase,
  IGetUserCompaniesContext,
  IGetUserCompaniesUseCase,
  IRemoveCompanyMemberContext,
  IRemoveCompanyMemberUseCase,
  IUpdateCompanyContext,
  IUpdateCompanyMemberContext,
  IUpdateCompanyMemberUseCase,
  IUpdateCompanyUseCase,
} from '@repo/domains/applications/company';
import type { Company, CompanyMember } from '@repo/domains/entities/company';
import type {
  ICompanyMemberRepository,
  ICompanyRepository,
} from '@repo/domains/repositories/company';
import {
  createCompanyMemberSchema,
  createCompanySchema,
  updateCompanyMemberSchema,
  updateCompanySchema,
} from '@repo/domains/schema/company';
import { RequirePermission } from '../decorators/permission.decorator';
import { DuplicateError, NotFoundError, ValidationError } from '../lib/error';

export class CreateCompanyUseCase implements ICreateCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  @RequirePermission(PERMISSIONS.COMPANY.CREATE)
  async execute(context: ICreateCompanyContext): Promise<Company> {
    const parsed = await createCompanySchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError('Invalid company data', parsed.error.format());
    }

    const existing = await this.companyRepository.findBySlug(parsed.data.slug);
    if (existing) {
      throw new DuplicateError('Company with this slug already exists');
    }

    return this.companyRepository.create(parsed.data);
  }
}

export class UpdateCompanyUseCase implements IUpdateCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  @RequirePermission(PERMISSIONS.COMPANY.UPDATE, (ctx) => ({
    companyId: ctx.id,
  }))
  async execute(context: IUpdateCompanyContext): Promise<Company> {
    const existing = await this.companyRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Company with id ${context.id} not found`);
    }

    const parsed = await updateCompanySchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update company data',
        parsed.error.format(),
      );
    }

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugTaken = await this.companyRepository.findBySlug(
        parsed.data.slug,
      );
      if (slugTaken) {
        throw new DuplicateError('Company with this slug already exists');
      }
    }

    return this.companyRepository.update(context.id, parsed.data);
  }
}

export class DeleteCompanyUseCase implements IDeleteCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  @RequirePermission(PERMISSIONS.COMPANY.DELETE, (ctx) => ({
    companyId: ctx.id,
  }))
  async execute(context: IDeleteCompanyContext): Promise<void> {
    const existing = await this.companyRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Company with id ${context.id} not found`);
    }

    await this.companyRepository.delete(context.id);
  }
}

export class GetCompanyUseCase implements IGetCompanyUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  @RequirePermission(PERMISSIONS.COMPANY.READ, (ctx) => ({
    companyId: ctx.id,
  }))
  async execute(context: IGetCompanyContext): Promise<Company | null> {
    const company = await this.companyRepository.findById(context.id);
    if (!company) {
      throw new NotFoundError(`Company with id ${context.id} not found`);
    }
    return company;
  }
}

export class GetCompanyBySlugUseCase implements IGetCompanyBySlugUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  @RequirePermission(PERMISSIONS.COMPANY.READ)
  async execute(context: IGetCompanyBySlugContext): Promise<Company | null> {
    const company = await this.companyRepository.findBySlug(context.slug);
    if (!company) {
      throw new NotFoundError(`Company with slug ${context.slug} not found`);
    }
    return company;
  }
}

export class GetCompaniesUseCase implements IGetCompaniesUseCase {
  constructor(private readonly companyRepository: ICompanyRepository) {}

  @RequirePermission(PERMISSIONS.COMPANY.READ)
  async execute(_context?: IGetCompaniesContext): Promise<Company[]> {
    return this.companyRepository.findAll();
  }
}

export class AddCompanyMemberUseCase implements IAddCompanyMemberUseCase {
  constructor(
    private readonly memberRepository: ICompanyMemberRepository,
    private readonly companyRepository: ICompanyRepository,
  ) {}

  @RequirePermission(PERMISSIONS.COMPANY_MEMBER.CREATE, (ctx) => ({
    companyId: ctx.data.companyId,
  }))
  async execute(context: IAddCompanyMemberContext): Promise<CompanyMember> {
    const parsed = await createCompanyMemberSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid company member data',
        parsed.error.format(),
      );
    }

    const company = await this.companyRepository.findById(
      parsed.data.companyId,
    );
    if (!company) {
      throw new NotFoundError(
        `Company with id ${parsed.data.companyId} not found`,
      );
    }

    const existing = await this.memberRepository.findByCompanyAndUser(
      parsed.data.companyId,
      parsed.data.userId,
    );
    if (existing) {
      throw new DuplicateError('User is already a member of this company');
    }

    return this.memberRepository.create(parsed.data);
  }
}

export class UpdateCompanyMemberUseCase implements IUpdateCompanyMemberUseCase {
  constructor(private readonly memberRepository: ICompanyMemberRepository) {}

  @RequirePermission(PERMISSIONS.COMPANY_MEMBER.UPDATE)
  async execute(context: IUpdateCompanyMemberContext): Promise<CompanyMember> {
    const existing = await this.memberRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Company member with id ${context.id} not found`);
    }

    const parsed = await updateCompanyMemberSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update member data',
        parsed.error.format(),
      );
    }

    return this.memberRepository.update(context.id, parsed.data);
  }
}

export class RemoveCompanyMemberUseCase implements IRemoveCompanyMemberUseCase {
  constructor(private readonly memberRepository: ICompanyMemberRepository) {}

  @RequirePermission(PERMISSIONS.COMPANY_MEMBER.DELETE)
  async execute(context: IRemoveCompanyMemberContext): Promise<void> {
    const existing = await this.memberRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Company member with id ${context.id} not found`);
    }

    await this.memberRepository.delete(context.id);
  }
}

export class GetCompanyMembersUseCase implements IGetCompanyMembersUseCase {
  constructor(private readonly memberRepository: ICompanyMemberRepository) {}

  @RequirePermission(PERMISSIONS.COMPANY_MEMBER.READ, (ctx) => ({
    companyId: ctx.companyId,
  }))
  async execute(context: IGetCompanyMembersContext): Promise<CompanyMember[]> {
    return this.memberRepository.findByCompanyId(context.companyId);
  }
}

export class GetUserCompaniesUseCase implements IGetUserCompaniesUseCase {
  constructor(private readonly memberRepository: ICompanyMemberRepository) {}

  @RequirePermission(PERMISSIONS.COMPANY.READ)
  async execute(context: IGetUserCompaniesContext): Promise<CompanyMember[]> {
    return this.memberRepository.findByUserId(context.userId);
  }
}
