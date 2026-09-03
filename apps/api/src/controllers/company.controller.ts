/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import db from '@repo/database/db';
import * as schema from '@repo/database/schema';
import {
  createCompanyBranchSchema,
  createCompanyMemberSchema,
  createCompanySchema,
  updateCompanyBranchSchema,
  updateCompanyMemberSchema,
  updateCompanySchema,
} from '@repo/domains/schema/company';
import {
  AddCompanyMemberUseCase,
  CreateCompanyBranchUseCase,
  CreateCompanyUseCase,
  DeleteCompanyBranchUseCase,
  DeleteCompanyUseCase,
  GetCompaniesUseCase,
  GetCompanyBranchesUseCase,
  GetCompanyBranchUseCase,
  GetCompanyBySlugUseCase,
  GetCompanyMembersUseCase,
  GetCompanyUseCase,
  GetUserCompaniesUseCase,
  NotFoundError,
  RemoveCompanyMemberUseCase,
  UnauthorizedError,
  UpdateCompanyBranchUseCase,
  UpdateCompanyMemberUseCase,
  UpdateCompanyUseCase,
} from '@repo/applications';
import Controller from './base.controller';

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const slugParamSchema = z.object({
  slug: z.string().min(1),
});

const companyMemberParamSchema = z.object({
  companyId: z.string().uuid(),
});

export class CompanyController extends Controller {
  constructor(
    private readonly createCompanyUseCase: CreateCompanyUseCase,
    private readonly updateCompanyUseCase: UpdateCompanyUseCase,
    private readonly deleteCompanyUseCase: DeleteCompanyUseCase,
    private readonly getCompanyUseCase: GetCompanyUseCase,
    private readonly getCompanyBySlugUseCase: GetCompanyBySlugUseCase,
    private readonly getCompaniesUseCase: GetCompaniesUseCase,
    private readonly addCompanyMemberUseCase: AddCompanyMemberUseCase,
    private readonly updateCompanyMemberUseCase: UpdateCompanyMemberUseCase,
    private readonly removeCompanyMemberUseCase: RemoveCompanyMemberUseCase,
    private readonly getCompanyMembersUseCase: GetCompanyMembersUseCase,
    private readonly getUserCompaniesUseCase: GetUserCompaniesUseCase,
    private readonly createCompanyBranchUseCase?: CreateCompanyBranchUseCase,
    private readonly updateCompanyBranchUseCase?: UpdateCompanyBranchUseCase,
    private readonly deleteCompanyBranchUseCase?: DeleteCompanyBranchUseCase,
    private readonly getCompanyBranchesUseCase?: GetCompanyBranchesUseCase,
    private readonly getCompanyBranchUseCase?: GetCompanyBranchUseCase,
  ) {
    super();
  }

  public getCompanies = async (c: Parameters<typeof this.success>[0]) => {
    const user = (c as any).get('user');
    const companies = await this.getCompaniesUseCase.execute({
      userId: user?.id,
    });
    return this.success(c, 'Companies retrieved successfully', companies);
  };

  public getCompany = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const user = (c as any).get('user');
    const company = await this.getCompanyUseCase.execute({
      id,
      userId: user?.id,
      companyId: id,
    });
    return this.success(c, 'Company retrieved successfully', company);
  });

  public getCompanyBySlug = this.validator(
    { params: slugParamSchema },
    async (c) => {
      const { slug } = c.get('params');
      const user = (c as any).get('user');
      const company = await this.getCompanyBySlugUseCase.execute({
        slug,
        userId: user?.id,
      });
      return this.success(c, 'Company retrieved successfully', company);
    },
  );

  public createCompany = this.validator(
    { body: createCompanySchema },
    async (c) => {
      const body = c.get('body');
      const user = (c as any).get('user');
      const company = await this.createCompanyUseCase.execute({
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Company created successfully', company);
    },
  );

  public updateCompany = this.validator(
    { params: idParamSchema, body: updateCompanySchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = (c as any).get('user');
      const company = await this.updateCompanyUseCase.execute({
        id,
        data: body,
        userId: user?.id,
        companyId: id,
      });
      return this.success(c, 'Company updated successfully', company);
    },
  );

  public deleteCompany = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = (c as any).get('user');
      await this.deleteCompanyUseCase.execute({
        id,
        userId: user?.id,
        companyId: id,
      });
      return this.success(c, 'Company deleted successfully');
    },
  );

  public getMembers = this.validator(
    { params: companyMemberParamSchema },
    async (c) => {
      const { companyId } = c.get('params');
      const user = (c as any).get('user');
      const members = await this.getCompanyMembersUseCase.execute({
        companyId,
        userId: user?.id,
      });
      return this.success(c, 'Company members retrieved successfully', members);
    },
  );

  public addMember = this.validator(
    { body: createCompanyMemberSchema },
    async (c) => {
      const body = c.get('body');
      const user = (c as any).get('user');
      const member = await this.addCompanyMemberUseCase.execute({
        data: body,
        userId: user?.id,
        companyId: body.companyId,
      });
      return this.created(c, 'Company member added successfully', member);
    },
  );

  public updateMember = this.validator(
    { params: idParamSchema, body: updateCompanyMemberSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = (c as any).get('user');
      const member = await this.updateCompanyMemberUseCase.execute({
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'Company member updated successfully', member);
    },
  );

  public removeMember = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const user = (c as any).get('user');
    await this.removeCompanyMemberUseCase.execute({
      id,
      userId: user?.id,
    });
    return this.success(c, 'Company member removed successfully');
  });

  // ─── Company Branch Endpoints ──────────────────────────────────────────────
  public getBranches = this.validator(
    { params: companyMemberParamSchema },
    async (c) => {
      const { companyId } = c.get('params');
      const user = (c as any).get('user');
      if (!this.getCompanyBranchesUseCase) {
        throw new Error('GetCompanyBranchesUseCase is not injected');
      }
      const branches = await this.getCompanyBranchesUseCase.execute({
        companyId,
        userId: user?.id,
      });
      return this.success(
        c,
        'Company branches retrieved successfully',
        branches,
      );
    },
  );

  public getBranch = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const user = (c as any).get('user');
    if (!this.getCompanyBranchUseCase) {
      throw new Error('GetCompanyBranchUseCase is not injected');
    }
    const branch = await this.getCompanyBranchUseCase.execute({
      id,
      userId: user?.id,
    });
    return this.success(c, 'Company branch retrieved successfully', branch);
  });

  public createBranch = this.validator(
    { body: createCompanyBranchSchema },
    async (c) => {
      const body = c.get('body');
      const user = (c as any).get('user');
      if (!this.createCompanyBranchUseCase) {
        throw new Error('CreateCompanyBranchUseCase is not injected');
      }
      const branch = await this.createCompanyBranchUseCase.execute({
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Company branch created successfully', branch);
    },
  );

  public updateBranch = this.validator(
    { params: idParamSchema, body: updateCompanyBranchSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = (c as any).get('user');
      if (!this.updateCompanyBranchUseCase) {
        throw new Error('UpdateCompanyBranchUseCase is not injected');
      }
      const branch = await this.updateCompanyBranchUseCase.execute({
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'Company branch updated successfully', branch);
    },
  );

  public deleteBranch = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const user = (c as any).get('user');
    const companyId = c.req.query('companyId') || '';
    if (!this.deleteCompanyBranchUseCase) {
      throw new Error('DeleteCompanyBranchUseCase is not injected');
    }
    await this.deleteCompanyBranchUseCase.execute({
      id,
      companyId,
      userId: user?.id,
    });
    return this.success(c, 'Company branch deleted successfully');
  });

  public switchActiveCompany = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = (c as any).get('user');
      const currentSession = (c as any).get('session');

      if (!currentSession?.id) {
        throw new UnauthorizedError('Session not found');
      }

      const company = await this.getCompanyUseCase.execute({
        id,
        userId: user?.id,
        companyId: id,
      });

      if (!company || !company.isActive) {
        throw new NotFoundError('Company not found or inactive');
      }

      await db
        .update(schema.session)
        .set({ activeCompanyId: id, updatedAt: new Date() })
        .where(eq(schema.session.id, currentSession.id));

      return this.success(c, 'Active company switched successfully', {
        activeCompanyId: id,
        company,
      });
    },
  );
}
