import type { BaseUseCase } from '../../index';
import type { ISecurityContext } from '#constants/permissions';
import type { Role } from '#entities/permission';
import type { CreateRole, UpdateRole } from '#schema/permission';

// Context Types
export type ICreateRoleContext = ISecurityContext & { data: CreateRole };
export type IUpdateRoleContext = ISecurityContext & {
  id: string;
  data: UpdateRole;
};
export type IDeleteRoleContext = ISecurityContext & { id: string };
export type IGetRoleContext = ISecurityContext & { id: string };
export type IGetRolesByCompanyContext = ISecurityContext & {
  companyId: string;
};
export type IGetSystemDefaultRolesContext = ISecurityContext | void;

// Use Case Contracts
export type ICreateRoleUseCase = BaseUseCase<ICreateRoleContext, Role>;
export type IUpdateRoleUseCase = BaseUseCase<IUpdateRoleContext, Role>;
export type IDeleteRoleUseCase = BaseUseCase<IDeleteRoleContext, void>;
export type IGetRoleUseCase = BaseUseCase<IGetRoleContext, Role | null>;
export type IGetRolesByCompanyUseCase = BaseUseCase<
  IGetRolesByCompanyContext,
  Role[]
>;
export type IGetSystemDefaultRolesUseCase = BaseUseCase<
  IGetSystemDefaultRolesContext | void,
  Role[]
>;
