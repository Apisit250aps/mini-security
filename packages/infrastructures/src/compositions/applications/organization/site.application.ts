import {
  CreateSiteUseCase,
  DeleteSiteUseCase,
  GetSitesUseCase,
  GetSiteUseCase,
  UpdateSiteUseCase,
} from '@repo/applications';
import {
  siteRepository,
  organizationMemberRepository,
  organizationRepository,
} from '../../repositories';

export const createSiteUseCase = new CreateSiteUseCase(
  siteRepository,
  organizationRepository,
);

export const updateSiteUseCase = new UpdateSiteUseCase(siteRepository);

export const deleteSiteUseCase = new DeleteSiteUseCase(
  siteRepository,
  organizationMemberRepository,
);

export const getSitesUseCase = new GetSitesUseCase(siteRepository);

export const getSiteUseCase = new GetSiteUseCase(siteRepository);
