import {
  formServicesGetSubmission,
  formServicesGetTemplate,
  formServicesListSubmissions,
  formServicesListTemplatesByOrganization,
  formServicesListMyAssignments,
  formServicesListOccurrenceAssignments,
  formServicesListReviewQueue,
  formServicesGetReviewDetail,
  formServicesListPlans,
  formServicesGetPlan,
  formServicesListOccurrences,
  formServicesPreviewSchedule,
} from '@repo/client';
import { useQuery } from '@tanstack/react-query';
import { formKeys } from '@/shared/utils';

export function useOrganizationFormTemplatesQueries(organizationId: string) {
  return useQuery({
    queryKey: formKeys.templates(organizationId),
    queryFn: async ({ signal }) => {
      const response = await formServicesListTemplatesByOrganization({
        signal,
        path: { organizationId },
      });
      return response.data?.data || [];
    },
    enabled: Boolean(organizationId),
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
  organizationId?: string;
  assignmentId?: string;
}) {
  const targetOrgId = filters?.organizationId;
  const cleanFilters = filters
    ? Object.fromEntries(
        Object.entries({
          ...filters,
          organizationId: targetOrgId,
        }).filter(([_, v]) => v !== undefined && v !== ''),
      )
    : undefined;

  return useQuery({
    queryKey: formKeys.submissions(targetOrgId, cleanFilters),
    queryFn: async ({ signal }) => {
      const response = await formServicesListSubmissions({
        signal,
        query: cleanFilters,
      });
      return response.data?.data || [];
    },
    enabled: targetOrgId === undefined || Boolean(targetOrgId),
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

export function useMyAssignmentsQueries(filters: {
  organizationId?: string;
  memberId?: string;
}) {
  const targetOrgId = filters.organizationId || '';
  return useQuery({
    queryKey: formKeys.myAssignments(targetOrgId, filters.memberId),
    queryFn: async ({ signal }) => {
      const response = await formServicesListMyAssignments({
        signal,
        query: {
          organizationId: targetOrgId,
          memberId: filters.memberId,
        },
      });
      return response.data?.data || [];
    },
    enabled: Boolean(targetOrgId),
  });
}

export function useOccurrenceAssignmentsQueries(occurrenceId?: string) {
  return useQuery({
    queryKey: occurrenceId
      ? formKeys.occurrenceAssignments(occurrenceId)
      : ['FORM', 'OCCURRENCE', 'NONE', 'ASSIGNMENTS'],
    queryFn: async ({ signal }) => {
      if (!occurrenceId) return [];
      const response = await formServicesListOccurrenceAssignments({
        signal,
        path: { id: occurrenceId },
      });
      return response.data?.data || [];
    },
    enabled: Boolean(occurrenceId),
  });
}

export function useReviewQueueQueries(filters: { organizationId?: string }) {
  const targetOrgId = filters.organizationId || '';
  return useQuery({
    queryKey: ['FORM', 'REVIEW_QUEUE', targetOrgId, filters],
    queryFn: async ({ signal }) => {
      const response = await formServicesListReviewQueue({
        signal,
        query: {
          organizationId: targetOrgId,
        },
      });
      return response.data?.data || [];
    },
    enabled: Boolean(targetOrgId),
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

export function useFormPlansQueries(
  organizationId: string,
  templateId?: string,
) {
  return useQuery({
    queryKey: formKeys.plans(organizationId, templateId),
    queryFn: async ({ signal }) => {
      const response = await formServicesListPlans({
        signal,
        query: { organizationId },
      });
      const allPlans = response.data?.data || [];
      if (templateId) {
        return allPlans.filter((p) => p.formTemplateId === templateId);
      }
      return allPlans;
    },
    enabled: Boolean(organizationId),
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
  organizationId?: string;
  formTemplateId?: string;
  planId?: string;
}) {
  const targetOrgId = filters.organizationId || '';
  return useQuery({
    queryKey: formKeys.occurrences(targetOrgId, filters.formTemplateId),
    queryFn: async ({ signal }) => {
      const response = await formServicesListOccurrences({
        signal,
        query: {
          organizationId: targetOrgId,
          formTemplateId: filters.formTemplateId,
          planId: filters.planId,
        },
      });
      return response.data?.data || [];
    },
    enabled: Boolean(targetOrgId),
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
