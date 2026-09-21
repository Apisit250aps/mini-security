import { unitOfWork } from '../../unit-of-work';
import {
  AddOrganizationMemberUseCase,
  GetOrganizationMembersUseCase,
  GetUserOrganizationsUseCase,
  RemoveOrganizationMemberUseCase,
  UpdateOrganizationMemberUseCase,
} from '@repo/applications';
import {
  siteRepository,
  organizationMemberRepository,
  organizationRepository,
  roleRepository,
} from '../../repositories';

export const addOrganizationMemberUseCase = new AddOrganizationMemberUseCase(
  unitOfWork,
  organizationMemberRepository,
  organizationRepository,
  roleRepository,
  siteRepository,
);
export const updateOrganizationMemberUseCase =
  new UpdateOrganizationMemberUseCase(
    organizationMemberRepository,
    roleRepository,
    siteRepository,
  );
export const removeOrganizationMemberUseCase =
  new RemoveOrganizationMemberUseCase(
    organizationMemberRepository,
    roleRepository,
  );
export const getOrganizationMembersUseCase = new GetOrganizationMembersUseCase(
  organizationMemberRepository,
);
export const getUserOrganizationsUseCase = new GetUserOrganizationsUseCase(
  organizationMemberRepository,
);
