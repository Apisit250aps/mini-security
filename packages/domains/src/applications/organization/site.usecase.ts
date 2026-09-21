import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { Site } from '#entities/organization';
import type { CreateSite, UpdateSite } from '#schema/organization';

// Context Types
export type ICreateSiteContext = ISecurityContext & {
  data: CreateSite;
};
export type IUpdateSiteContext = ISecurityContext & {
  id: string;
  data: UpdateSite;
};
export type IDeleteSiteContext = ISecurityContext & {
  id: string;
  organizationId: string;
};
export type IGetSiteContext = ISecurityContext & {
  id: string;
};
export type IGetSitesContext = ISecurityContext & {
  organizationId: string;
};

// Use Case Contracts
export type ICreateSiteUseCase = BaseUseCase<ICreateSiteContext, Site>;
export type IUpdateSiteUseCase = BaseUseCase<IUpdateSiteContext, Site>;
export type IDeleteSiteUseCase = BaseUseCase<IDeleteSiteContext, void>;
export type IGetSiteUseCase = BaseUseCase<IGetSiteContext, Site | null>;
export type IGetSitesUseCase = BaseUseCase<IGetSitesContext, Site[]>;
