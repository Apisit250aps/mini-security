import type { IUnitOfWork } from '@repo/domains';
import type {
  ICreateOrganizationContext,
  ICreateOrganizationUseCase,
  IDeleteOrganizationContext,
  IDeleteOrganizationUseCase,
  IGetOrganizationsContext,
  IGetOrganizationsUseCase,
  IGetOrganizationBySlugContext,
  IGetOrganizationBySlugUseCase,
  IGetOrganizationContext,
  IGetOrganizationUseCase,
  IUpdateOrganizationContext,
  IUpdateOrganizationUseCase,
} from '@repo/domains/applications/organization';
import type { Organization } from '@repo/domains/entities/organization';
import type {
  ISiteRepository,
  IOrganizationRepository,
} from '@repo/domains/repositories/organization';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
} from '@repo/domains/schema/organization';
import { RequirePermission } from '../../decorators/permission.decorator';
import {
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class CreateOrganizationUseCase implements ICreateOrganizationUseCase {
  constructor(
    private readonly unitOfWork: IUnitOfWork,
    private readonly organizationRepository: IOrganizationRepository,
    private readonly siteRepository?: ISiteRepository,
  ) {}

  @RequirePermission('organization:create')
  async execute(context: ICreateOrganizationContext): Promise<Organization> {
    return this.unitOfWork.transaction(async () => {
      const parsed = await createOrganizationSchema.safeParseAsync(
        context.data,
      );
      if (!parsed.success) {
        throw new ValidationError(
          'Invalid organization data',
          parsed.error.format(),
        );
      }

      const existing = await this.organizationRepository.findBySlug(
        parsed.data.slug,
      );
      if (existing) {
        throw new DuplicateError('Organization with this slug already exists');
      }

      const newOrganization = await this.organizationRepository.create(
        parsed.data,
      );

      // Auto-create default site if no site exists yet
      if (this.siteRepository) {
        const existingSites = await this.siteRepository.findByOrganizationId(
          newOrganization.id,
        );
        if (existingSites.length === 0) {
          await this.siteRepository.create({
            organizationId: newOrganization.id,
            name: 'สำนักงานใหญ่ (Headquarters)',
            address: null,
            isActive: true,
          });
        }
      }

      return newOrganization;
    });
  }
}

export class UpdateOrganizationUseCase implements IUpdateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  @RequirePermission('organization:update', (ctx) => ({
    organizationId: ctx.id,
  }))
  async execute(context: IUpdateOrganizationContext): Promise<Organization> {
    const existing = await this.organizationRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Organization with id ${context.id} not found`);
    }

    const parsed = await updateOrganizationSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update organization data',
        parsed.error.format(),
      );
    }

    if (parsed.data.slug && parsed.data.slug !== existing.slug) {
      const slugTaken = await this.organizationRepository.findBySlug(
        parsed.data.slug,
      );
      if (slugTaken) {
        throw new DuplicateError('Organization with this slug already exists');
      }
    }

    return this.organizationRepository.update(context.id, parsed.data);
  }
}

export class DeleteOrganizationUseCase implements IDeleteOrganizationUseCase {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  @RequirePermission('organization:delete', (ctx) => ({
    organizationId: ctx.id,
  }))
  async execute(context: IDeleteOrganizationContext): Promise<void> {
    const existing = await this.organizationRepository.findById(context.id);
    if (!existing) {
      throw new NotFoundError(`Organization with id ${context.id} not found`);
    }

    await this.organizationRepository.delete(context.id);
  }
}

export class GetOrganizationUseCase implements IGetOrganizationUseCase {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  @RequirePermission('organization:read', (ctx) => ({
    organizationId: ctx.id,
  }))
  async execute(
    context: IGetOrganizationContext,
  ): Promise<Organization | null> {
    const organization = await this.organizationRepository.findById(context.id);
    if (!organization) {
      throw new NotFoundError(`Organization with id ${context.id} not found`);
    }
    return organization;
  }
}

export class GetOrganizationBySlugUseCase
  implements IGetOrganizationBySlugUseCase
{
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  @RequirePermission('organization:read')
  async execute(
    context: IGetOrganizationBySlugContext,
  ): Promise<Organization | null> {
    const organization = await this.organizationRepository.findBySlug(
      context.slug,
    );
    if (!organization) {
      throw new NotFoundError(
        `Organization with slug "${context.slug}" not found`,
      );
    }
    return organization;
  }
}

export class GetOrganizationsUseCase implements IGetOrganizationsUseCase {
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  @RequirePermission('organization:read')
  async execute(_context?: IGetOrganizationsContext): Promise<Organization[]> {
    return this.organizationRepository.findAll();
  }
}
