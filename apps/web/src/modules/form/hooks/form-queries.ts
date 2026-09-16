import {
  formServicesGetSubmission,
  formServicesGetTemplate,
  formServicesListSubmissions,
  formServicesListTemplatesByCompany,
  formServicesListMyAssignments,
  formServicesListReviewQueue,
  formServicesGetReviewDetail,
  formServicesListPlans,
  formServicesGetPlan,
  formServicesListOccurrences,
  formServicesPreviewSchedule,
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
  assignmentId?: string;
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

export function useMyAssignmentsQueries(filters: { companyId: string, memberId: string }) {
  return useQuery({
    queryKey: ['FORM', 'MY_ASSIGNMENTS', filters.companyId, filters],
    queryFn: async ({ signal }) => {
      const response = await formServicesListMyAssignments({
        signal,
        query: {
          companyId: filters.companyId,
          memberId: filters.memberId,
        },
      });
      return response.data?.data || [];
    },
    enabled: Boolean(filters.companyId && filters.memberId),
  });
}

export function useReviewQueueQueries(filters: { companyId: string }) {
  return useQuery({
    queryKey: ['FORM', 'REVIEW_QUEUE', filters.companyId, filters],
    queryFn: async ({ signal }) => {
      const response = await formServicesListReviewQueue({
        signal,
        query: {
          companyId: filters.companyId,
        },
      });
      return response.data?.data || [];
    },
    enabled: Boolean(filters.companyId),
  });
}

export function useReviewDetailQueries(submissionId: string) {
  return useQuery({
    queryKey: ['FORM', 'REVIEW_DETAIL', submissionId],
    queryFn: async ({ signal }) => {
      const response = await formServicesGetReviewDetail({
        signal,
        path: { id: submissionId },
      });
      return response.data?.data || [];
    },
    enabled: Boolean(submissionId),
  });
}

export function useFormPlansQueries(companyId: string, templateId?: string) {
  return useQuery({
    queryKey: formKeys.plans(companyId, templateId),
    queryFn: async ({ signal }) => {
      const response = await formServicesListPlans({
        signal,
        query: { companyId },
      });
      const allPlans = response.data?.data || [];
      if (templateId) {
        return allPlans.filter((p) => p.formTemplateId === templateId);
      }
      return allPlans;
    },
    enabled: Boolean(companyId),
  });
}

export function useFormPlanDetailQueries(planId: string) {
  return useQuery({
    queryKey: formKeys.plan(planId),
    queryFn: async ({ signal }) => {
      const response = await formServicesGetPlan({
        signal,
        path: { id: planId },
      });
      return response.data?.data || null;
    },
    enabled: Boolean(planId),
  });
}

export function useFormOccurrencesQueries(filters: {
  companyId: string;
  formTemplateId?: string;
  planId?: string;
}) {
  return useQuery({
    queryKey: formKeys.occurrences(filters.companyId, filters.formTemplateId),
    queryFn: async ({ signal }) => {
      const response = await formServicesListOccurrences({
        signal,
        query: filters,
      });
      return response.data?.data || [];
    },
    enabled: Boolean(filters.companyId),
  });
}

export function useFormSchedulePreviewQueries(planId: string) {
  return useQuery({
    queryKey: formKeys.schedulePreview(planId),
    queryFn: async ({ signal }) => {
      const response = await formServicesPreviewSchedule({
        signal,
        path: { id: planId },
      });
      return response.data?.data || [];
    },
    enabled: Boolean(planId),
  });
}



