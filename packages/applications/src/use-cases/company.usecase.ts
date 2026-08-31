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
import type { IRoleRepository } from '@repo/domains/repositories/permission';
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

  @RequirePermission('company:create')
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

  @RequirePermission('company:update', (ctx) => ({
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

  @RequirePermission('company:delete', (ctx) => ({
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

  @RequirePermission('company:read', (ctx) => ({
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

  @RequirePermission('company:read')
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

  @RequirePermission('company:read')
  async execute(_context?: IGetCompaniesContext): Promise<Company[]> {
    return this.companyRepository.findAll();
  }
}

export class AddCompanyMemberUseCase implements IAddCompanyMemberUseCase {
  constructor(
    private readonly memberRepository: ICompanyMemberRepository,
    private readonly companyRepository: ICompanyRepository,
    private readonly roleRepository?: IRoleRepository,
  ) {}

  @RequirePermission('company_member:create', (ctx) => ({
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

    // Role verification: ensure role belongs to this company and is not super admin/system default
    if (this.roleRepository) {
      const targetRole = await this.roleRepository.findById(parsed.data.roleId);
      if (!targetRole) {
        throw new NotFoundError(`Role with id ${parsed.data.roleId} not found`);
      }
      if (
        targetRole.roleType === 'SUPER_ADMIN' ||
        (targetRole.companyId && targetRole.companyId !== parsed.data.companyId)
      ) {
        throw new ValidationError(
          'บริษัทไม่สามารถมอบหมายบทบาท Super Admin หรือบทบาทข้ามองค์กรได้',
        );
      }
    }

    return this.memberRepository.create(parsed.data);
  }
}

export class UpdateCompanyMemberUseCase implements IUpdateCompanyMemberUseCase {
  constructor(
    private readonly memberRepository: ICompanyMemberRepository,
    private readonly roleRepository?: IRoleRepository,
  ) {}

  @RequirePermission('company_member:update')
  async execute(context: IUpdateCompanyMemberContext): Promise<CompanyMember> {
    const existing = await this.memberRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Company member with id ${context.id} not found`);
    }

    // If current member is Owner, role/permissions cannot be changed
    if (this.roleRepository) {
      const currentRole = await this.roleRepository.findById(existing.roleId);
      if (currentRole && currentRole.name.toLowerCase() === 'owner') {
        throw new ValidationError(
          'ไม่สามารถเปลี่ยนแปลงสิทธิ์หรือแก้ไขบทบาทของ Owner ได้',
        );
      }
    }

    const parsed = await updateCompanyMemberSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update member data',
        parsed.error.format(),
      );
    }

    // Role verification: ensure new role belongs to this company and is not super admin/cross-company
    if (parsed.data.roleId && this.roleRepository) {
      const targetRole = await this.roleRepository.findById(parsed.data.roleId);
      if (!targetRole) {
        throw new NotFoundError(`Role with id ${parsed.data.roleId} not found`);
      }
      if (
        targetRole.roleType === 'SUPER_ADMIN' ||
        (targetRole.companyId && targetRole.companyId !== existing.companyId)
      ) {
        throw new ValidationError(
          'บริษัทไม่สามารถมอบหมายบทบาท Super Admin หรือบทบาทข้ามองค์กรได้',
        );
      }
    }

    return this.memberRepository.update(context.id, parsed.data);
  }
}

export class RemoveCompanyMemberUseCase implements IRemoveCompanyMemberUseCase {
  constructor(
    private readonly memberRepository: ICompanyMemberRepository,
    private readonly roleRepository?: IRoleRepository,
  ) {}

  @RequirePermission('company_member:delete')
  async execute(context: IRemoveCompanyMemberContext): Promise<void> {
    const existing = await this.memberRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Company member with id ${context.id} not found`);
    }

    if (this.roleRepository) {
      const currentRole = await this.roleRepository.findById(existing.roleId);
      if (currentRole && currentRole.name.toLowerCase() === 'owner') {
        throw new ValidationError(
          'ไม่สามารถลบหรือถอดถอน Owner ออกจากบริษัทได้',
        );
      }
    }

    await this.memberRepository.delete(context.id);
  }
}

export class GetCompanyMembersUseCase implements IGetCompanyMembersUseCase {
  constructor(private readonly memberRepository: ICompanyMemberRepository) {}

  @RequirePermission('company_member:read', (ctx) => ({
    companyId: ctx.companyId,
  }))
  async execute(context: IGetCompanyMembersContext): Promise<CompanyMember[]> {
    return this.memberRepository.findByCompanyId(context.companyId);
  }
}

export class GetUserCompaniesUseCase implements IGetUserCompaniesUseCase {
  constructor(private readonly memberRepository: ICompanyMemberRepository) {}

  @RequirePermission('company:read')
  async execute(context: IGetUserCompaniesContext): Promise<CompanyMember[]> {
    return this.memberRepository.findByUserId(context.userId);
  }
}
