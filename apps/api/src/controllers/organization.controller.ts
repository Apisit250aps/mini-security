import { getUserPermissionActions } from '@repo/infrastructures/lib/auth-permissions';
import { eq } from 'drizzle-orm';
import db from '@repo/database/db';
import * as schema from '@repo/database/schema';
import {
  organizationSchema,
  organizationMemberSchema,
  createSiteSchema,
  createOrganizationMemberSchema,
  createOrganizationSchema,
  updateSiteSchema,
  updateOrganizationMemberSchema,
  updateOrganizationSchema,
} from '@repo/domains/schema/organization';
import {
  AddOrganizationMemberUseCase,
  CreateSiteUseCase,
  CreateOrganizationUseCase,
  DeleteSiteUseCase,
  DeleteOrganizationUseCase,
  GetOrganizationsUseCase,
  GetSitesUseCase,
  GetSiteUseCase,
  GetOrganizationBySlugUseCase,
  GetOrganizationMembersUseCase,
  GetOrganizationUseCase,
  GetUserOrganizationsUseCase,
  NotFoundError,
  RemoveOrganizationMemberUseCase,
  UnauthorizedError,
  UpdateSiteUseCase,
  UpdateOrganizationMemberUseCase,
  UpdateOrganizationUseCase,
} from '@repo/applications';
import Controller from './base.controller';

const idParamSchema = organizationSchema.pick({ id: true });

const slugParamSchema = organizationSchema.pick({ slug: true });

const organizationMemberParamSchema = organizationMemberSchema.pick({
  organizationId: true,
});

export class OrganizationController extends Controller {
  constructor(
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
    private readonly deleteOrganizationUseCase: DeleteOrganizationUseCase,
    private readonly getOrganizationUseCase: GetOrganizationUseCase,
    private readonly getOrganizationBySlugUseCase: GetOrganizationBySlugUseCase,
    private readonly getOrganizationsUseCase: GetOrganizationsUseCase,
    private readonly addOrganizationMemberUseCase: AddOrganizationMemberUseCase,
    private readonly updateOrganizationMemberUseCase: UpdateOrganizationMemberUseCase,
    private readonly removeOrganizationMemberUseCase: RemoveOrganizationMemberUseCase,
    private readonly getOrganizationMembersUseCase: GetOrganizationMembersUseCase,
    private readonly getUserOrganizationsUseCase: GetUserOrganizationsUseCase,
    private readonly createSiteUseCase?: CreateSiteUseCase,
    private readonly updateSiteUseCase?: UpdateSiteUseCase,
    private readonly deleteSiteUseCase?: DeleteSiteUseCase,
    private readonly getSitesUseCase?: GetSitesUseCase,
    private readonly getSiteUseCase?: GetSiteUseCase,
  ) {
    super();
  }

  public getOrganizations = async (c: Parameters<typeof this.success>[0]) => {
    const user = c.get('user');
    const organizations = await this.getOrganizationsUseCase.execute({
      ...this.securityContext(c),
      userId: user?.id,
    });
    return this.success(
      c,
      'Organizations retrieved successfully',
      organizations,
    );
  };

  public getOrganization = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      const organization = await this.getOrganizationUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
        organizationId: id,
      });
      return this.success(
        c,
        'Organization retrieved successfully',
        organization,
      );
    },
  );

  public getOrganizationBySlug = this.validator(
    { params: slugParamSchema },
    async (c) => {
      const { slug } = c.get('params');
      const user = c.get('user');
      const organization = await this.getOrganizationBySlugUseCase.execute({
        ...this.securityContext(c),
        slug,
        userId: user?.id,
      });
      return this.success(
        c,
        'Organization retrieved successfully',
        organization,
      );
    },
  );

  public createOrganization = this.validator(
    { body: createOrganizationSchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const organization = await this.createOrganizationUseCase.execute({
        ...this.securityContext(c),
        data: body,
        userId: user?.id,
      });
      return this.created(c, 'Organization created successfully', organization);
    },
  );

  public updateOrganization = this.validator(
    { params: idParamSchema, body: updateOrganizationSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const organization = await this.updateOrganizationUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
        userId: user?.id,
        organizationId: id,
      });
      return this.success(c, 'Organization updated successfully', organization);
    },
  );

  public deleteOrganization = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      await this.deleteOrganizationUseCase.execute({
        ...this.securityContext(c),
        id,
        userId: user?.id,
        organizationId: id,
      });
      return this.success(c, 'Organization deleted successfully');
    },
  );

  public getMembers = this.validator(
    { params: organizationMemberParamSchema },
    async (c) => {
      const { organizationId } = c.get('params');
      const user = c.get('user');
      const members = await this.getOrganizationMembersUseCase.execute({
        ...this.securityContext(c),
        organizationId,
        userId: user?.id,
      });
      return this.success(
        c,
        'Organization members retrieved successfully',
        members,
      );
    },
  );

  public addMember = this.validator(
    { body: createOrganizationMemberSchema },
    async (c) => {
      const body = c.get('body');
      const user = c.get('user');
      const member = await this.addOrganizationMemberUseCase.execute({
        ...this.securityContext(c),
        data: body,
        userId: user?.id,
        organizationId: body.organizationId,
      });
      return this.created(c, 'Organization member added successfully', member);
    },
  );

  public updateMember = this.validator(
    { params: idParamSchema, body: updateOrganizationMemberSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      const member = await this.updateOrganizationMemberUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(
        c,
        'Organization member updated successfully',
        member,
      );
    },
  );

  public removeMember = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const user = c.get('user');
    await this.removeOrganizationMemberUseCase.execute({
      ...this.securityContext(c),
      id,
      userId: user?.id,
    });
    return this.success(c, 'Organization member removed successfully');
  });

  // ─── Site Endpoints ────────────────────────────────────────────────────────
  public getSites = this.validator(
    { params: organizationMemberParamSchema },
    async (c) => {
      const { organizationId } = c.get('params');
      const user = c.get('user');
      if (!this.getSitesUseCase) {
        throw new Error('GetSitesUseCase is not injected');
      }
      const sites = await this.getSitesUseCase.execute({
        ...this.securityContext(c),
        organizationId,
        userId: user?.id,
      });
      return this.success(c, 'Sites retrieved successfully', sites);
    },
  );

  public getSite = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const user = c.get('user');
    if (!this.getSiteUseCase) {
      throw new Error('GetSiteUseCase is not injected');
    }
    const site = await this.getSiteUseCase.execute({
      ...this.securityContext(c),
      id,
      userId: user?.id,
    });
    return this.success(c, 'Site retrieved successfully', site);
  });

  public createSite = this.validator({ body: createSiteSchema }, async (c) => {
    const body = c.get('body');
    const user = c.get('user');
    if (!this.createSiteUseCase) {
      throw new Error('CreateSiteUseCase is not injected');
    }
    const site = await this.createSiteUseCase.execute({
      ...this.securityContext(c),
      data: body,
      userId: user?.id,
    });
    return this.created(c, 'Site created successfully', site);
  });

  public updateSite = this.validator(
    { params: idParamSchema, body: updateSiteSchema },
    async (c) => {
      const { id } = c.get('params');
      const body = c.get('body');
      const user = c.get('user');
      if (!this.updateSiteUseCase) {
        throw new Error('UpdateSiteUseCase is not injected');
      }
      const site = await this.updateSiteUseCase.execute({
        ...this.securityContext(c),
        id,
        data: body,
        userId: user?.id,
      });
      return this.success(c, 'Site updated successfully', site);
    },
  );

  public deleteSite = this.validator({ params: idParamSchema }, async (c) => {
    const { id } = c.get('params');
    const user = c.get('user');
    const organizationId = c.req.query('organizationId') || '';
    if (!this.deleteSiteUseCase) {
      throw new Error('DeleteSiteUseCase is not injected');
    }
    await this.deleteSiteUseCase.execute({
      ...this.securityContext(c),
      id,
      organizationId,
      userId: user?.id,
    });
    return this.success(c, 'Site deleted successfully');
  });

  public switchActiveOrganization = this.validator(
    { params: idParamSchema },
    async (c) => {
      const { id } = c.get('params');
      const user = c.get('user');
      const currentSession = c.get('session');

      if (!currentSession?.id) {
        throw new UnauthorizedError('Session not found');
      }

      const { actions, organizationId } = await getUserPermissionActions(
        user.id,
        id,
      );
      const security = this.securityContext(c);
      security.permissions = actions.join(',');
      security.activeOrganizationId = organizationId;

      const organization = await this.getOrganizationUseCase.execute({
        ...security,
        id,
        userId: user?.id,
        organizationId: id,
      });

      if (!organization || !organization.isActive) {
        throw new NotFoundError('Organization not found or inactive');
      }

      await db
        .update(schema.session)
        .set({
          activeOrganizationId: id,
          updatedAt: new Date(),
        })
        .where(eq(schema.session.id, currentSession.id));

      return this.success(c, 'Active organization switched successfully', {
        activeOrganizationId: id,
        organization,
      });
    },
  );
}
