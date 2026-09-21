import type { IUnitOfWork } from '@repo/domains';
import type {
  IAddOrganizationMemberContext,
  IAddOrganizationMemberUseCase,
  IGetOrganizationMembersContext,
  IGetOrganizationMembersUseCase,
  IGetUserOrganizationsContext,
  IGetUserOrganizationsUseCase,
  IRemoveOrganizationMemberContext,
  IRemoveOrganizationMemberUseCase,
  IUpdateOrganizationMemberContext,
  IUpdateOrganizationMemberUseCase,
} from '@repo/domains/applications/organization';
import type { OrganizationMember } from '@repo/domains/entities/organization';
import type {
  ISiteRepository,
  IOrganizationMemberRepository,
  IOrganizationRepository,
} from '@repo/domains/repositories/organization';
import type { IRoleRepository } from '@repo/domains/repositories/permission';
import {
  createOrganizationMemberSchema,
  updateOrganizationMemberSchema,
} from '@repo/domains/schema/organization';
import { RequirePermission } from '../../decorators/permission.decorator';
import {
  DuplicateError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class AddOrganizationMemberUseCase
  implements IAddOrganizationMemberUseCase
{
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly memberRepository: IOrganizationMemberRepository,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly siteRepository?: ISiteRepository,
  ) {}

  @RequirePermission('organization_member:create', (ctx) => ({
    organizationId: ctx.data?.organizationId,
  }))
  async execute(
    context: IAddOrganizationMemberContext,
  ): Promise<OrganizationMember> {
    return this.unitOfWork.transaction(async () => {
      const parsed = await createOrganizationMemberSchema.safeParseAsync(
        context.data,
      );
      if (!parsed.success) {
        throw new ValidationError(
          'Invalid organization member data',
          parsed.error.format(),
        );
      }

      const organization = await this.organizationRepository.findById(
        parsed.data.organizationId,
      );
      if (!organization) {
        throw new NotFoundError(
          `Organization with id ${parsed.data.organizationId} not found`,
        );
      }

      const existing = await this.memberRepository.findByOrganizationAndUser(
        parsed.data.organizationId,
        parsed.data.userId,
      );
      if (existing) {
        throw new DuplicateError(
          'User is already a member of this organization',
        );
      }

      // Role verification: ensure role belongs to this organization and is not super admin/system default
      if (this.roleRepository) {
        const targetRole = await this.roleRepository.findById(
          parsed.data.roleId,
        );
        if (!targetRole) {
          throw new NotFoundError(
            `Role with id ${parsed.data.roleId} not found`,
          );
        }
        if (
          targetRole.roleType === 'SUPER_ADMIN' ||
          (targetRole.organizationId &&
            targetRole.organizationId !== parsed.data.organizationId)
        ) {
          throw new ValidationError(
            'องค์กรไม่สามารถมอบหมายบทบาท Super Admin หรือบทบาทข้ามองค์กรได้',
          );
        }
      }

      // Site verification & default site assignment
      let targetSiteId = parsed.data.siteId;
      if (this.siteRepository) {
        if (targetSiteId) {
          const site = await this.siteRepository.findById(targetSiteId);
          if (!site || site.organizationId !== parsed.data.organizationId) {
            throw new NotFoundError('ไม่พบสาขาที่ระบุในองค์กรนี้');
          }
        } else {
          // Auto-assign to default site
          const defaultSite =
            await this.siteRepository.findDefaultByOrganizationId(
              parsed.data.organizationId,
            );
          if (defaultSite) {
            targetSiteId = defaultSite.id;
          } else {
            const sites = await this.siteRepository.findByOrganizationId(
              parsed.data.organizationId,
            );
            const firstSite = sites[0];
            if (firstSite) {
              targetSiteId = firstSite.id;
            } else {
              const newSite = await this.siteRepository.create({
                organizationId: parsed.data.organizationId,
                name: 'สำนักงานใหญ่ (Headquarters)',
                address: null,
                isActive: true,
              });
              targetSiteId = newSite.id;
            }
          }
        }
      }

      if (!targetSiteId) {
        throw new ValidationError('ไม่พบสาขาสำหรับกำหนดให้พนักงาน');
      }

      return this.memberRepository.create({
        ...parsed.data,
        siteId: targetSiteId,
      });
    });
  }
}

export class UpdateOrganizationMemberUseCase
  implements IUpdateOrganizationMemberUseCase
{
  constructor(
    public readonly memberRepository: IOrganizationMemberRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly siteRepository?: ISiteRepository,
  ) {}

  @RequirePermission('organization_member:update', {
    resolveResource: (useCase: UpdateOrganizationMemberUseCase, context) =>
      useCase.memberRepository.findById(context.id!),
    notFoundMessage: 'OrganizationMember not found',
  })
  async execute(
    context: IUpdateOrganizationMemberContext,
    existing?: OrganizationMember,
  ): Promise<OrganizationMember> {
    if (!existing) {
      throw new NotFoundError(
        `Organization member with id ${context.id} not found`,
      );
    }

    if (!context.user?.isAdmin) {
      const actor = await this.memberRepository.findByOrganizationAndUser(
        existing.organizationId,
        context.user!.id,
      );
      if (!actor?.isActive)
        throw new ForbiddenError('Active organization membership required');
    }
    if (
      (context.data.organizationId &&
        context.data.organizationId !== existing.organizationId) ||
      (context.data.userId && context.data.userId !== existing.userId)
    ) {
      throw new ValidationError(
        'Member organization and user cannot be changed',
      );
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

    const parsed = await updateOrganizationMemberSchema.safeParseAsync(
      context.data,
    );
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update member data',
        parsed.error.format(),
      );
    }

    // Role verification: ensure new role belongs to this organization and is not super admin/cross-organization
    if (parsed.data.roleId && this.roleRepository) {
      const targetRole = await this.roleRepository.findById(parsed.data.roleId);
      if (!targetRole) {
        throw new NotFoundError(`Role with id ${parsed.data.roleId} not found`);
      }
      if (
        targetRole.roleType === 'SUPER_ADMIN' ||
        (targetRole.organizationId &&
          targetRole.organizationId !== existing.organizationId)
      ) {
        throw new ValidationError(
          'องค์กรไม่สามารถมอบหมายบทบาท Super Admin หรือบทบาทข้ามองค์กรได้',
        );
      }
    }

    // Site verification if changing site
    if (parsed.data.siteId && this.siteRepository) {
      const targetSite = await this.siteRepository.findById(parsed.data.siteId);
      if (
        !targetSite ||
        targetSite.organizationId !== existing.organizationId
      ) {
        throw new NotFoundError('ไม่พบสาขาที่ระบุในองค์กรนี้');
      }
    }

    return this.memberRepository.update(context.id, parsed.data);
  }
}

export class RemoveOrganizationMemberUseCase
  implements IRemoveOrganizationMemberUseCase
{
  constructor(
    public readonly memberRepository: IOrganizationMemberRepository,
    private readonly roleRepository: IRoleRepository,
  ) {}

  @RequirePermission('organization_member:delete', {
    resolveResource: (useCase: RemoveOrganizationMemberUseCase, context) =>
      useCase.memberRepository.findById(context.id!),
    notFoundMessage: 'OrganizationMember not found',
  })
  async execute(
    context: IRemoveOrganizationMemberContext,
    existing?: OrganizationMember,
  ): Promise<void> {
    if (!existing) {
      throw new NotFoundError(
        `Organization member with id ${context.id} not found`,
      );
    }

    if (!context.user?.isAdmin) {
      const actor = await this.memberRepository.findByOrganizationAndUser(
        existing.organizationId,
        context.user!.id,
      );
      if (!actor?.isActive)
        throw new ForbiddenError('Active organization membership required');
    }

    if (this.roleRepository) {
      const currentRole = await this.roleRepository.findById(existing.roleId);
      if (!currentRole) throw new NotFoundError('Member role not found');
      if (currentRole?.roleType === 'OWNER' && !context.user?.isAdmin) {
        throw new ForbiddenError('ไม่สามารถลบหรือถอดถอน Owner ออกจากองค์กรได้');
      }
    }

    await this.memberRepository.delete(context.id);
  }
}

export class GetOrganizationMembersUseCase
  implements IGetOrganizationMembersUseCase
{
  constructor(
    private readonly memberRepository: IOrganizationMemberRepository,
  ) {}

  @RequirePermission('organization_member:read', (ctx) => ({
    organizationId: ctx.organizationId,
  }))
  async execute(
    context: IGetOrganizationMembersContext,
  ): Promise<OrganizationMember[]> {
    return this.memberRepository.findByOrganizationId(context.organizationId);
  }
}

export class GetUserOrganizationsUseCase
  implements IGetUserOrganizationsUseCase
{
  constructor(
    private readonly memberRepository: IOrganizationMemberRepository,
  ) {}

  @RequirePermission('organization:read')
  async execute(
    context: IGetUserOrganizationsContext,
  ): Promise<OrganizationMember[]> {
    return this.memberRepository.findByUserId(context.userId);
  }
}
