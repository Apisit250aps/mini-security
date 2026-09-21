import { unitOfWork } from '../../unit-of-work';
import {
  CreateOrganizationUseCase,
  DeleteOrganizationUseCase,
  GetOrganizationsUseCase,
  GetOrganizationBySlugUseCase,
  GetOrganizationUseCase,
  UpdateOrganizationUseCase,
} from '@repo/applications';
import { siteRepository, organizationRepository } from '../../repositories';

export const createOrganizationUseCase = new CreateOrganizationUseCase(
  unitOfWork,
  organizationRepository,
  siteRepository,
);
export const updateOrganizationUseCase = new UpdateOrganizationUseCase(
  organizationRepository,
);
export const deleteOrganizationUseCase = new DeleteOrganizationUseCase(
  organizationRepository,
);
export const getOrganizationUseCase = new GetOrganizationUseCase(
  organizationRepository,
);
export const getOrganizationBySlugUseCase = new GetOrganizationBySlugUseCase(
  organizationRepository,
);
export const getOrganizationsUseCase = new GetOrganizationsUseCase(
  organizationRepository,
);
