import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { Organization } from '#entities/organization';
import type {
  CreateOrganization,
  UpdateOrganization,
} from '#schema/organization';

// Context Types
export type ICreateOrganizationContext = ISecurityContext & {
  data: CreateOrganization;
};
export type IUpdateOrganizationContext = ISecurityContext & {
  id: string;
  data: UpdateOrganization;
};
export type IDeleteOrganizationContext = ISecurityContext & { id: string };
export type IGetOrganizationContext = ISecurityContext & { id: string };
export type IGetOrganizationBySlugContext = ISecurityContext & { slug: string };
export type IGetOrganizationsContext = ISecurityContext & {
  filter?: Record<string, unknown>;
};

// Use Case Contracts
export type ICreateOrganizationUseCase = BaseUseCase<
  ICreateOrganizationContext,
  Organization
>;
export type IUpdateOrganizationUseCase = BaseUseCase<
  IUpdateOrganizationContext,
  Organization
>;
export type IDeleteOrganizationUseCase = BaseUseCase<
  IDeleteOrganizationContext,
  void
>;
export type IGetOrganizationUseCase = BaseUseCase<
  IGetOrganizationContext,
  Organization | null
>;
export type IGetOrganizationBySlugUseCase = BaseUseCase<
  IGetOrganizationBySlugContext,
  Organization | null
>;
export type IGetOrganizationsUseCase = BaseUseCase<
  IGetOrganizationsContext | void,
  Organization[]
>;
