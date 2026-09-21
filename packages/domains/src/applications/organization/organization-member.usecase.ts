import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { OrganizationMember } from '#entities/organization';
import type {
  CreateOrganizationMember,
  UpdateOrganizationMember,
} from '#schema/organization';

// Context Types
export type IAddOrganizationMemberContext = ISecurityContext & {
  data: CreateOrganizationMember;
};
export type IUpdateOrganizationMemberContext = ISecurityContext & {
  id: string;
  data: UpdateOrganizationMember;
};
export type IRemoveOrganizationMemberContext = ISecurityContext & {
  id: string;
};
export type IGetOrganizationMembersContext = ISecurityContext & {
  organizationId: string;
};
export type IGetUserOrganizationsContext = ISecurityContext & {
  userId: string;
};

// Use Case Contracts
export type IAddOrganizationMemberUseCase = BaseUseCase<
  IAddOrganizationMemberContext,
  OrganizationMember
>;
export type IUpdateOrganizationMemberUseCase = BaseUseCase<
  IUpdateOrganizationMemberContext,
  OrganizationMember
>;
export type IRemoveOrganizationMemberUseCase = BaseUseCase<
  IRemoveOrganizationMemberContext,
  void
>;
export type IGetOrganizationMembersUseCase = BaseUseCase<
  IGetOrganizationMembersContext,
  OrganizationMember[]
>;
export type IGetUserOrganizationsUseCase = BaseUseCase<
  IGetUserOrganizationsContext,
  OrganizationMember[]
>;
