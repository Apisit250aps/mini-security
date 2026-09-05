import type {
  IAddCompanyMemberContext,
  IAddCompanyMemberUseCase,
  IGetCompanyMembersContext,
  IGetCompanyMembersUseCase,
  IGetUserCompaniesContext,
  IGetUserCompaniesUseCase,
  IRemoveCompanyMemberContext,
  IRemoveCompanyMemberUseCase,
  IUpdateCompanyMemberContext,
  IUpdateCompanyMemberUseCase,
} from '@repo/domains/applications/company';
import type { CompanyMember } from '@repo/domains/entities/company';
import type {
  ICompanyBranchRepository,
  ICompanyMemberRepository,
  ICompanyRepository,
} from '@repo/domains/repositories/company';
import type { IRoleRepository } from '@repo/domains/repositories/permission';
import {
  createCompanyMemberSchema,
  updateCompanyMemberSchema,
} from '@repo/domains/schema/company';
import { RequirePermission } from '../../decorators/permission.decorator';
import {
  DuplicateError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class AddCompanyMemberUseCase implements IAddCompanyMemberUseCase {
  constructor(
    private readonly memberRepository: ICompanyMemberRepository,
    private readonly companyRepository: ICompanyRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly branchRepository?: ICompanyBranchRepository,
  ) {}

  @RequirePermission('company_member:create', (ctx) => ({
    companyId: ctx.data?.companyId,
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

    // Branch verification & default branch assignment
    let targetBranchId = parsed.data.companyBranchId;
    if (this.branchRepository) {
      if (targetBranchId) {
        const branch = await this.branchRepository.findById(targetBranchId);
        if (!branch || branch.companyId !== parsed.data.companyId) {
          throw new NotFoundError('ไม่พบสาขาที่ระบุในบริษัทนี้');
        }
      } else {
        // Auto-assign to default branch
        const defaultBranch =
          await this.branchRepository.findDefaultByCompanyId(
            parsed.data.companyId,
          );
        if (defaultBranch) {
          targetBranchId = defaultBranch.id;
        } else {
          const branches = await this.branchRepository.findByCompanyId(
            parsed.data.companyId,
          );
          const firstBranch = branches[0];
          if (firstBranch) {
            targetBranchId = firstBranch.id;
          } else {
            const newBranch = await this.branchRepository.create({
              companyId: parsed.data.companyId,
              name: 'สำนักงานใหญ่ (Headquarters)',
              address: null,
              isActive: true,
            });
            targetBranchId = newBranch.id;
          }
        }
      }
    }

    if (!targetBranchId) {
      throw new ValidationError('ไม่พบสาขาสำหรับกำหนดให้พนักงาน');
    }

    return this.memberRepository.create({
      ...parsed.data,
      companyBranchId: targetBranchId,
    });
  }
}

export class UpdateCompanyMemberUseCase implements IUpdateCompanyMemberUseCase {
  constructor(
    private readonly memberRepository: ICompanyMemberRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly branchRepository?: ICompanyBranchRepository,
  ) {}

  @RequirePermission('company_member:update', {
    resolveResource: (useCase: UpdateCompanyMemberUseCase, context) =>
      useCase.memberRepository.findById(context.id!),
    notFoundMessage: 'CompanyMember not found',
  })
  async execute(
    context: IUpdateCompanyMemberContext,
    existing?: CompanyMember,
  ): Promise<CompanyMember> {
    if (!existing) {
      throw new NotFoundError(`Company member with id ${context.id} not found`);
    }

    if (!context.user?.isAdmin) {
      const actor = await this.memberRepository.findByCompanyAndUser(
        existing.companyId,
        context.user!.id,
      );
      if (!actor?.isActive)
        throw new ForbiddenError('Active company membership required');
    }
    if (
      (context.data.companyId &&
        context.data.companyId !== existing.companyId) ||
      (context.data.userId && context.data.userId !== existing.userId)
    ) {
      throw new ValidationError('Member company and user cannot be changed');
    }

    // If current member is Owner, role/permissions cannot be changed
    if (this.roleRepository) {
      const currentRole = await this.roleRepository.findById(existing.roleId);
      if (
        currentRole &&
        currentRole.roleType === 'OWNER' &&
        !context.user?.isAdmin &&
        ((context.data.roleId && context.data.roleId !== existing.roleId) ||
          context.data.isActive === false)
      ) {
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

    // Branch verification if changing branch
    if (parsed.data.companyBranchId && this.branchRepository) {
      const targetBranch = await this.branchRepository.findById(
        parsed.data.companyBranchId,
      );
      if (!targetBranch || targetBranch.companyId !== existing.companyId) {
        throw new NotFoundError('ไม่พบสาขาที่ระบุในบริษัทนี้');
      }
    }

    return this.memberRepository.update(context.id, parsed.data);
  }
}

export class RemoveCompanyMemberUseCase implements IRemoveCompanyMemberUseCase {
  constructor(
    private readonly memberRepository: ICompanyMemberRepository,
    private readonly roleRepository: IRoleRepository,
  ) {}

  @RequirePermission('company_member:delete', {
    resolveResource: (useCase: RemoveCompanyMemberUseCase, context) =>
      useCase.memberRepository.findById(context.id!),
    notFoundMessage: 'CompanyMember not found',
  })
  async execute(
    context: IRemoveCompanyMemberContext,
    existing?: CompanyMember,
  ): Promise<void> {
    if (!existing) {
      throw new NotFoundError(`Company member with id ${context.id} not found`);
    }

    if (!context.user?.isAdmin) {
      const actor = await this.memberRepository.findByCompanyAndUser(
        existing.companyId,
        context.user!.id,
      );
      if (!actor?.isActive)
        throw new ForbiddenError('Active company membership required');
    }

    if (this.roleRepository) {
      const currentRole = await this.roleRepository.findById(existing.roleId);
      if (!currentRole) throw new NotFoundError('Member role not found');
      if (currentRole?.roleType === 'OWNER' && !context.user?.isAdmin) {
        throw new ForbiddenError('ไม่สามารถลบหรือถอดถอน Owner ออกจากบริษัทได้');
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
