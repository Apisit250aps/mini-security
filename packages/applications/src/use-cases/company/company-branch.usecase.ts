import type {
  ICreateCompanyBranchContext,
  ICreateCompanyBranchUseCase,
  IDeleteCompanyBranchContext,
  IDeleteCompanyBranchUseCase,
  IGetCompanyBranchesContext,
  IGetCompanyBranchesUseCase,
  IGetCompanyBranchContext,
  IGetCompanyBranchUseCase,
  IUpdateCompanyBranchContext,
  IUpdateCompanyBranchUseCase,
} from '@repo/domains/applications/company';
import type { CompanyBranch } from '@repo/domains/entities/company';
import type {
  ICompanyBranchRepository,
  ICompanyMemberRepository,
  ICompanyRepository,
} from '@repo/domains/repositories/company';
import {
  createCompanyBranchSchema,
  updateCompanyBranchSchema,
} from '@repo/domains/schema/company';
import { RequirePermission } from '../../decorators/permission.decorator';
import {
  DuplicateError,
  NotFoundError,
  ValidationError,
} from '../../lib/error';

export class CreateCompanyBranchUseCase implements ICreateCompanyBranchUseCase {
  constructor(
    private readonly branchRepository: ICompanyBranchRepository,
    private readonly companyRepository: ICompanyRepository,
  ) {}

  @RequirePermission('company_branch:create', (ctx) => ({
    companyId: ctx.data?.companyId,
  }))
  async execute(context: ICreateCompanyBranchContext): Promise<CompanyBranch> {
    const parsed = await createCompanyBranchSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError('Invalid branch data', parsed.error.format());
    }

    const company = await this.companyRepository.findById(
      parsed.data.companyId,
    );
    if (!company) {
      throw new NotFoundError(
        `Company with id ${parsed.data.companyId} not found`,
      );
    }

    const existingName = await this.branchRepository.findByName(
      parsed.data.companyId,
      parsed.data.name,
    );
    if (existingName) {
      throw new DuplicateError('สาขาชื่อนี้มีอยู่ในบริษัทแล้ว');
    }

    return this.branchRepository.create(parsed.data);
  }
}

export class UpdateCompanyBranchUseCase implements IUpdateCompanyBranchUseCase {
  constructor(private readonly branchRepository: ICompanyBranchRepository) {}

  @RequirePermission('company_branch:update', {
    resolveResource: (useCase: UpdateCompanyBranchUseCase, context) =>
      useCase.branchRepository.findById(context.id!),
    notFoundMessage: 'CompanyBranch not found',
  })
  async execute(
    context: IUpdateCompanyBranchContext,
    existing?: CompanyBranch,
  ): Promise<CompanyBranch> {
    if (!existing) {
      throw new NotFoundError(`Branch with id ${context.id} not found`);
    }

    const parsed = await updateCompanyBranchSchema.safeParseAsync(context.data);
    if (!parsed.success) {
      throw new ValidationError(
        'Invalid update branch data',
        parsed.error.format(),
      );
    }

    if (parsed.data.companyId && parsed.data.companyId !== existing.companyId) {
      throw new ValidationError('Branch company cannot be changed');
    }

    if (parsed.data.name && parsed.data.name !== existing.name) {
      const duplicate = await this.branchRepository.findByName(
        existing.companyId,
        parsed.data.name,
      );
      if (duplicate && duplicate.id !== existing.id) {
        throw new DuplicateError('สาขาชื่อนี้มีอยู่ในบริษัทแล้ว');
      }
    }

    return this.branchRepository.update(context.id, parsed.data);
  }
}

export class DeleteCompanyBranchUseCase implements IDeleteCompanyBranchUseCase {
  constructor(
    private readonly branchRepository: ICompanyBranchRepository,
    private readonly memberRepository?: ICompanyMemberRepository,
  ) {}

  @RequirePermission('company_branch:delete', {
    resolveResource: (useCase: DeleteCompanyBranchUseCase, context) =>
      useCase.branchRepository.findById(context.id!),
    notFoundMessage: 'CompanyBranch not found',
  })
  async execute(
    context: IDeleteCompanyBranchContext,
    existing?: CompanyBranch,
  ): Promise<void> {
    if (!existing) {
      throw new NotFoundError(`Branch with id ${context.id} not found`);
    }

    // Check if there are active members assigned to this branch
    if (this.memberRepository) {
      const membersInBranch = await this.memberRepository.findByBranchId(
        context.id,
      );
      if (membersInBranch.length > 0) {
        throw new ValidationError(
          'ไม่สามารถลบสาขาที่มีพนักงานสังกัดอยู่ได้ กรุณาย้ายสาขาพนักงานก่อนทำการลบ',
        );
      }
    }

    // Check if it is the only branch in company
    const allBranches = await this.branchRepository.findByCompanyId(
      existing.companyId,
    );
    if (allBranches.length <= 1) {
      throw new ValidationError('ไม่สามารถลบสาขาหลักสาขาสุดท้ายขององค์กรได้');
    }

    await this.branchRepository.delete(context.id);
  }
}

export class GetCompanyBranchesUseCase implements IGetCompanyBranchesUseCase {
  constructor(private readonly branchRepository: ICompanyBranchRepository) {}

  @RequirePermission('company_branch:read', (ctx) => ({
    companyId: ctx.companyId,
  }))
  async execute(context: IGetCompanyBranchesContext): Promise<CompanyBranch[]> {
    return this.branchRepository.findByCompanyId(context.companyId);
  }
}

export class GetCompanyBranchUseCase implements IGetCompanyBranchUseCase {
  constructor(private readonly branchRepository: ICompanyBranchRepository) {}

  @RequirePermission('company_branch:read', {
    resolveResource: (useCase: GetCompanyBranchUseCase, context) =>
      useCase.branchRepository.findById(context.id!),
    notFoundMessage: 'CompanyBranch not found',
  })
  async execute(
    context: IGetCompanyBranchContext,
    branch?: CompanyBranch,
  ): Promise<CompanyBranch | null> {
    if (!branch) {
      throw new NotFoundError(`Branch with id ${context.id} not found`);
    }

    return branch;
  }
}
