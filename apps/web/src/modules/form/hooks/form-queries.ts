import {
  formServicesGetSubmission,
  formServicesGetTemplate,
  formServicesListSubmissions,
  formServicesListTemplatesByCompany,
} from '@repo/client';
import { useQuery } from '@tanstack/react-query';
import { formKeys } from '@/shared/utils';

export function useCompanyFormTemplatesQueries(companyId: string) {
  return useQuery({
    queryKey: formKeys.templates(companyId),
    queryFn: async ({ signal }) => {
      const response = await formServicesListTemplatesByCompany({
        signal,
        path: { companyId },
      });
      return response.data?.data || [];
    },
    enabled: Boolean(companyId),
  });
}

export function useFormTemplateQueries(id?: string) {
  return useQuery({
    queryKey: id ? formKeys.template(id) : ['FORM', 'TEMPLATE', 'NONE'],
    queryFn: async ({ signal }) => {
      if (!id) return null;
      const response = await formServicesGetTemplate({
        signal,
        path: { id },
      });
      return response.data?.data || null;
    },
    enabled: Boolean(id),
  });
}

export function useFormSubmissionsQueries(filters?: {
  companyId?: string;
  roleId?: string;
  formTemplateId?: string;
}) {
  return useQuery({
    queryKey: formKeys.submissions(filters?.companyId, filters),
    queryFn: async ({ signal }) => {
      const response = await formServicesListSubmissions({
        signal,
        query: filters,
      });
      return response.data?.data || [];
    },
  });
}

export function useFormSubmissionQueries(id?: string) {
  return useQuery({
    queryKey: id ? formKeys.submission(id) : ['FORM', 'SUBMISSION', 'NONE'],
    queryFn: async ({ signal }) => {
      if (!id) return null;
      const response = await formServicesGetSubmission({
        signal,
        path: { id },
      });
      return response.data?.data || null;
    },
    enabled: Boolean(id),
  });
}
