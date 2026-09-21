import type {
  ICreateSiteContext,
  ICreateSiteUseCase,
  IDeleteSiteContext,
  IDeleteSiteUseCase,
  IGetSitesContext,
  IGetSitesUseCase,
  IGetSiteContext,
  IGetSiteUseCase,
  IUpdateSiteContext,
  IUpdateSiteUseCase,
} from '@repo/domains/applications/organization';
import type { Site } from '@repo/domains/entities/organization';
import type {
  ISiteRepository,
  IOrganizationMemberRepository,
  IOrganizationRepository,
} from '@repo/domains/repositories/organization';
import {
  createSiteSchema,
  updateSiteSchema,
} from '@repo/domains/schema/organization';
import { RequirePermission } from '../../decorators/permission.decorator';
import {
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class CreateSiteUseCase implements ICreateSiteUseCase {
  constructor(
    private readonly siteRepository: ISiteRepository,
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  @RequirePermission('site:create', (ctx) => ({
    organizationId: ctx.data?.organizationId,
  }))
  async execute(context: ICreateSiteContext): Promise<Site> {
    const parsed = await createSiteSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError('Invalid site data', parsed.error.format());
    }

    const organization = await this.organizationRepository.findById(
      parsed.data.organizationId,
    );
    if (!organization) {
      throw new NotFoundError(
        `Organization with id ${parsed.data.organizationId} not found`,
      );
    }

    const existingName = await this.siteRepository.findByName(
      parsed.data.organizationId,
      parsed.data.name,
    );
    if (existingName) {
      throw new DuplicateError('สาขาชื่อนี้มีอยู่ในองค์กรแล้ว');
    }

    return this.siteRepository.create(parsed.data);
  }
}

export class UpdateSiteUseCase implements IUpdateSiteUseCase {
  constructor(public readonly siteRepository: ISiteRepository) {}

  @RequirePermission('site:update', {
    resolveResource: (useCase: UpdateSiteUseCase, context) =>
      useCase.siteRepository.findById(context.id!),
    notFoundMessage: 'Site not found',
  })
  async execute(context: IUpdateSiteContext, existing?: Site): Promise<Site> {
    if (!existing) {
      throw new NotFoundError(`Site with id ${context.id} not found`);
    }

    const parsed = await updateSiteSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update site data',
        parsed.error.format(),
      );
    }

    if (
      parsed.data.organizationId &&
      parsed.data.organizationId !== existing.organizationId
    ) {
      throw new ValidationError('Site organization cannot be changed');
    }

    if (parsed.data.name && parsed.data.name !== existing.name) {
      const duplicate = await this.siteRepository.findByName(
        existing.organizationId,
        parsed.data.name,
      );
      if (duplicate && duplicate.id !== existing.id) {
        throw new DuplicateError('สาขาชื่อนี้มีอยู่ในองค์กรแล้ว');
      }
    }

    return this.siteRepository.update(context.id, parsed.data);
  }
}

export class DeleteSiteUseCase implements IDeleteSiteUseCase {
  constructor(
    public readonly siteRepository: ISiteRepository,
    private readonly memberRepository?: IOrganizationMemberRepository,
  ) {}

  @RequirePermission('site:delete', {
    resolveResource: (useCase: DeleteSiteUseCase, context) =>
      useCase.siteRepository.findById(context.id!),
    notFoundMessage: 'Site not found',
  })
  async execute(context: IDeleteSiteContext, existing?: Site): Promise<void> {
    if (!existing) {
      throw new NotFoundError(`Site with id ${context.id} not found`);
    }

    // Check if there are active members assigned to this site
    if (this.memberRepository) {
      const membersInSite = await this.memberRepository.findBySiteId(
        context.id,
      );
      if (membersInSite.length > 0) {
        throw new ValidationError(
          'ไม่สามารถลบสาขาที่มีพนักงานสังกัดอยู่ได้ กรุณาย้ายสาขาพนักงานก่อนทำการลบ',
        );
      }
    }

    // Check if it is the only site in organization
    const allSites = await this.siteRepository.findByOrganizationId(
      existing.organizationId,
    );
    if (allSites.length <= 1) {
      throw new ValidationError('ไม่สามารถลบสาขาหลักสาขาสุดท้ายขององค์กรได้');
    }

    await this.siteRepository.delete(context.id);
  }
}

export class GetSitesUseCase implements IGetSitesUseCase {
  constructor(private readonly siteRepository: ISiteRepository) {}

  @RequirePermission('site:read', (ctx) => ({
    organizationId: ctx.organizationId,
  }))
  async execute(context: IGetSitesContext): Promise<Site[]> {
    return this.siteRepository.findByOrganizationId(context.organizationId);
  }
}

export class GetSiteUseCase implements IGetSiteUseCase {
  constructor(public readonly siteRepository: ISiteRepository) {}

  @RequirePermission('site:read', {
    resolveResource: (useCase: GetSiteUseCase, context) =>
      useCase.siteRepository.findById(context.id!),
    notFoundMessage: 'Site not found',
  })
  async execute(context: IGetSiteContext, site?: Site): Promise<Site | null> {
    if (!site) {
      throw new NotFoundError(`Site with id ${context.id} not found`);
    }

    return site;
  }
}
