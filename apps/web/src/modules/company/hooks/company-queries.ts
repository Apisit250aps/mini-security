import {
  companyServicesGetCompanies,
  companyServicesGetCompany,
  companyServicesGetCompanyMembers,
} from '@repo/client';
import { useQuery } from '@tanstack/react-query';
import { companyKeys } from '@/shared/utils';

function useCompanyListQueries() {
  const query = useQuery({
    queryKey: companyKeys.lists(),
    queryFn: async ({ signal }) => {
      const response = await companyServicesGetCompanies({ signal });
      if (response.data) return response.data.data;
      throw new Error('No data returned from companyServicesGetCompanies');
    },
  });
  return query;
}

function useCompanyDetailQueries(companyId: string) {
  const query = useQuery({
    queryKey: companyKeys.detail(companyId),
    queryFn: async ({ signal }) => {
      const response = await companyServicesGetCompany({
        signal,
        path: { id: companyId },
      });
      if (response.data) return response.data.data;
      throw new Error('No data returned from companyServicesGetCompany');
    },
    enabled: Boolean(companyId),
  });
  return query;
}

function useCompanyMembersQueries(companyId: string) {
  const query = useQuery({
    queryKey: [...companyKeys.detail(companyId), 'members'] as const,
    queryFn: async ({ signal }) => {
      const response = await companyServicesGetCompanyMembers({
        signal,
        path: { companyId },
      });
      if (response.data) return response.data.data;
      throw new Error('No data returned from companyServicesGetCompanyMembers');
    },
    enabled: Boolean(companyId),
  });
  return query;
}

export {
  useCompanyListQueries,
  useCompanyDetailQueries,
  useCompanyMembersQueries,
};
