import type {
  ICreateCompanyContext,
  ICreateCompanyUseCase,
  IDeleteCompanyContext,
  IDeleteCompanyUseCase,
  IGetCompaniesContext,
  IGetCompaniesUseCase,
  IGetCompanyBySlugContext,
  IGetCompanyBySlugUseCase,
  IGetCompanyContext,
  IGetCompanyUseCase,
  IUpdateCompanyContext,
  IUpdateCompanyUseCase,
} from '@repo/domains/applications/company';
import type { Company } from '@repo/domains/entities/company';
import type { ICompanyRepository } from '@repo/domains/repositories/company';
import {
  createCompanySchema,
  updateCompanySchema,
} from '@repo/domains/schema/company';
import { RequirePermission } from '../../decorators/permission.decorator';
import {
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

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
      throw new NotFoundError(`Company with slug "${context.slug}" not found`);
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
