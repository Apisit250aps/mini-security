import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/shared/utils';
import { formKeys } from '@/shared/utils/query';
import {
  formServicesCreateTemplate,
  formServicesUpdateTemplate,
  formServicesCreateSection,
  formServicesDeleteSection,
  formServicesReorderSections,
  formServicesCreateField,
  formServicesEditField,
  formServicesDeleteField,
  formServicesReorderFields,
  formServicesPublishVersion,
  formServicesCreatePlan,
  formServicesUpdatePlan,
  formServicesActivatePlan,
  formServicesPausePlan,
  formServicesOpenOccurrences,
  formServicesCancelOccurrence,
  formServicesCancelAssignment,
  formServicesReplaceAssignment,
  formServicesStartSubmission,
  formServicesSaveDraft,
  formServicesSubmit,
  formServicesCreateCorrection,
  formServicesRecordAnswerReview,
  formServicesRecordSectionReview,
  formServicesFinalizeReview,
} from '@repo/client';
import type {
  StartFormSubmissionRequest,
  CreateFormTemplate,
  UpdateFormTemplate,
  CreateFormSection,
  ReorderFormItemsRequest,
  CreateFormField,
  EditFormField,
  FormTemplateDetail,
  PublishFormVersionRequest,
  CreateFormPlanRequest,
  UpdateFormPlanRequest,
  OpenOccurrencesRequest,
  CancelOccurrenceRequest,
  CancelAssignmentRequest,
  ReplaceAssignmentRequest,
  SaveFormSubmissionDraftRequest,
  SubmitFormSubmissionRequest,
  RecordReviewRequest,
  FinalizeReviewRequest,
  ActivatePlanRequest,
  PausePlanRequest,
} from '@repo/client';

export function useFormTemplateCreate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFormTemplate) => {
      const res = await formServicesCreateTemplate({
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('สร้างแบบฟอร์มสำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: formKeys.templates(companyId),
      });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'สร้างแบบฟอร์มไม่สำเร็จ')),
  });
}

export function useFormTemplateUpdate(companyId: string, templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateFormTemplate) => {
      const res = await formServicesUpdateTemplate({
        path: { id: templateId },
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('แก้ไขแบบฟอร์มสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.template(templateId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.templates(companyId),
        }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'แก้ไขแบบฟอร์มไม่สำเร็จ')),
  });
}

export function useFormSectionCreate(companyId: string, templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFormSection) => {
      const res = await formServicesCreateSection({
        path: { id: templateId },
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('สร้างหมวดสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.template(templateId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.templates(companyId),
        }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'สร้างหมวดไม่สำเร็จ')),
  });
}

function useFormItemsReorder(
  companyId: string,
  templateId: string,
  kind: 'sections' | 'fields',
) {
  const queryClient = useQueryClient();
  const queryKey = formKeys.template(templateId);
  return useMutation({
    mutationKey: ['FORM', 'REORDER', templateId],
    mutationFn: async (body: ReorderFormItemsRequest) => {
      const service =
        kind === 'sections'
          ? formServicesReorderSections
          : formServicesReorderFields;
      return (
        await service({ path: { id: templateId }, body, throwOnError: true })
      ).data;
    },
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<FormTemplateDetail | null>(
        queryKey,
      );
      const orders = new Map(
        body.items.map((item) => [item.id, item.sortOrder]),
      );
      queryClient.setQueryData<FormTemplateDetail | null>(
        queryKey,
        (detail) => {
          if (!detail || detail.draftVersion?.id !== body.formVersionId)
            return detail;
          return {
            ...detail,
            [kind]: detail[kind]
              .map((item) => ({
                ...item,
                sortOrder: orders.get(item.id) ?? item.sortOrder,
              }))
              .sort((a, b) => a.sortOrder - b.sortOrder),
          };
        },
      );
      return { previous };
    },
    onError: (error, _body, context) => {
      if (context?.previous !== undefined)
        queryClient.setQueryData(queryKey, context.previous);
      toast.error(
        getErrorMessage(error, 'บันทึกลำดับไม่สำเร็จ คืนค่าลำดับเดิมแล้ว'),
      );
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({
          queryKey: formKeys.templates(companyId),
        }),
      ]);
    },
  });
}

export function useFormSectionReorder(companyId: string, templateId: string) {
  return useFormItemsReorder(companyId, templateId, 'sections');
}

export function useFormFieldReorder(companyId: string, templateId: string) {
  return useFormItemsReorder(companyId, templateId, 'fields');
}

export function useFormFieldCreate(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFormField) => {
      const res = await formServicesCreateField({
        path: { id: templateId },
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('สร้างคำถามสำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: formKeys.template(templateId),
      });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'สร้างคำถามไม่สำเร็จ')),
  });
}

export function useFormFieldEdit(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fieldId,
      data,
    }: {
      fieldId: string;
      data: EditFormField;
    }) => {
      const res = await formServicesEditField({
        path: { id: templateId, fieldId },
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('แก้ไขคำถามสำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: formKeys.template(templateId),
      });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'แก้ไขคำถามไม่สำเร็จ')),
  });
}

export function useFormFieldDelete(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (fieldId: string) => {
      const res = await formServicesDeleteField({
        path: { id: templateId, fieldId },
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('ลบคำถามสำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: formKeys.template(templateId),
      });
    },
    onError: (error) => toast.error(getErrorMessage(error, 'ลบคำถามไม่สำเร็จ')),
  });
}

export function useFormSectionDelete(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sectionId: string) => {
      const res = await formServicesDeleteSection({
        path: { id: templateId, sectionId },
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('ลบหมวดหมู่สำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: formKeys.template(templateId),
      });
    },
    onError: (error) => toast.error(getErrorMessage(error, 'ลบหมวดหมู่ไม่สำเร็จ')),
  });
}

export function useFormVersionPublish(companyId: string, templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PublishFormVersionRequest) => {
      const res = await formServicesPublishVersion({
        path: { id: templateId },
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('เริ่มใช้งานเวอร์ชันใหม่สำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.template(templateId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.plans(companyId, templateId),
        }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'เริ่มใช้งานเวอร์ชันไม่สำเร็จ')),
  });
}

export function useFormPlanCreate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFormPlanRequest) => {
      const res = await formServicesCreatePlan({
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      toast.success('สร้างแผนการทำงานสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: formKeys.plans(companyId) }),
        queryClient.invalidateQueries({
          queryKey: formKeys.template(variables.data.formTemplateId),
        }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'สร้างแผนการทำงานไม่สำเร็จ')),
  });
}

export function useFormPlanUpdate(companyId: string, planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateFormPlanRequest) => {
      const res = await formServicesUpdatePlan({
        path: { id: planId },
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async (result) => {
      toast.success('บันทึกการตั้งค่าแผนการตรวจสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: formKeys.plan(planId) }),
        queryClient.invalidateQueries({ queryKey: formKeys.plans(companyId) }),
        queryClient.invalidateQueries({
          queryKey: formKeys.schedulePreview(planId),
        }),
      ]);
      return result;
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'บันทึกการตั้งค่าแผนการตรวจไม่สำเร็จ')),
  });
}

export function useFormPlanActivate(companyId: string, planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: ActivatePlanRequest) => {
      const res = await formServicesActivatePlan({
        path: { id: planId },
        body,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('เปิดใช้งานแผนการทำงานสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: formKeys.plan(planId) }),
        queryClient.invalidateQueries({ queryKey: formKeys.plans(companyId) }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'เปิดใช้งานแผนการทำงานไม่สำเร็จ')),
  });
}

export function useFormPlanPause(companyId: string, planId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: PausePlanRequest) => {
      const res = await formServicesPausePlan({
        path: { id: planId },
        body,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('ระงับแผนการทำงานสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: formKeys.plan(planId) }),
        queryClient.invalidateQueries({ queryKey: formKeys.plans(companyId) }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'ระงับแผนการทำงานไม่สำเร็จ')),
  });
}

export function useFormOccurrencesOpen(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: OpenOccurrencesRequest) => {
      const res = await formServicesOpenOccurrences({
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('เปิดรอบทำงานสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.occurrences(companyId),
        }),
        queryClient.invalidateQueries({ queryKey: formKeys.plans(companyId) }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'เปิดรอบทำงานไม่สำเร็จ')),
  });
}

export function useFormOccurrenceCancel(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CancelOccurrenceRequest;
    }) => {
      const res = await formServicesCancelOccurrence({
        path: { id },
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      toast.success('ยกเลิกรอบทำงานสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.occurrence(variables.id),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.occurrences(companyId),
        }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'ยกเลิกรอบทำงานไม่สำเร็จ')),
  });
}

export function useFormAssignmentCancel(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CancelAssignmentRequest;
    }) => {
      const res = await formServicesCancelAssignment({
        path: { id },
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      toast.success('ยกเลิกงานสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.assignment(variables.id),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.myAssignments(companyId),
        }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'ยกเลิกงานไม่สำเร็จ')),
  });
}

export function useFormAssignmentReplace(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: ReplaceAssignmentRequest;
    }) => {
      const res = await formServicesReplaceAssignment({
        path: { id },
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      toast.success('เปลี่ยนผู้รับผิดชอบงานสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.assignment(variables.id),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.myAssignments(companyId),
        }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'เปลี่ยนผู้รับผิดชอบงานไม่สำเร็จ')),
  });
}

export function useFormSubmissionStart(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StartFormSubmissionRequest) => {
      const res = await formServicesStartSubmission({
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      toast.success('เริ่มบันทึกแบบฟอร์มสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.assignment(variables.assignmentId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['FORM', 'ASSIGNMENTS'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['FORM', 'OCCURRENCE'],
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.submissions(companyId),
        }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'เริ่มบันทึกแบบฟอร์มไม่สำเร็จ')),
  });
}

export function useFormSubmissionSaveDraft(
  submissionId: string,
  companyId?: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SaveFormSubmissionDraftRequest) => {
      const res = await formServicesSaveDraft({
        path: { id: submissionId },
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('บันทึกฉบับร่างสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.submission(submissionId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['FORM', 'ASSIGNMENTS'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['FORM', 'OCCURRENCE'],
        }),
        ...(companyId
          ? [
              queryClient.invalidateQueries({
                queryKey: formKeys.submissions(companyId),
              }),
            ]
          : []),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'บันทึกฉบับร่างไม่สำเร็จ')),
  });
}

export function useFormSubmissionSubmit(
  submissionId: string,
  companyId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SubmitFormSubmissionRequest) => {
      const res = await formServicesSubmit({
        path: { id: submissionId },
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('ส่งแบบฟอร์มสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.submission(submissionId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.submissions(companyId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['FORM', 'ASSIGNMENTS'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['FORM', 'OCCURRENCE'],
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.reviewQueue(companyId),
        }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'ส่งแบบฟอร์มไม่สำเร็จ')),
  });
}

export function useFormSubmissionCreateCorrection(
  submissionId: string,
  companyId: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_vars: void) => {
      const res = await formServicesCreateCorrection({
        path: { id: submissionId },
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('สร้างฉบับแก้ไขสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.submission(submissionId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.submissions(companyId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['FORM', 'ASSIGNMENTS'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['FORM', 'OCCURRENCE'],
        }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'สร้างฉบับแก้ไขไม่สำเร็จ')),
  });
}

export function useFormSubmissionCreateCorrectionMutation(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (submissionId: string) => {
      const res = await formServicesCreateCorrection({
        path: { id: submissionId },
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async (_data, submissionId) => {
      toast.success('สร้างฉบับแก้ไขสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.submission(submissionId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.submissions(companyId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['FORM', 'ASSIGNMENTS'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['FORM', 'OCCURRENCE'],
        }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'สร้างฉบับแก้ไขไม่สำเร็จ')),
  });
}

export function useFormReviewRecordAnswer(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      submissionId,
      answerId,
      data,
    }: {
      submissionId: string;
      answerId: string;
      data: RecordReviewRequest;
    }) => {
      const res = await formServicesRecordAnswerReview({
        path: { id: submissionId, answerId },
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.submission(variables.submissionId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.reviewDetail(variables.submissionId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.reviewQueue(companyId),
        }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'บันทึกผลตรวจข้อไม่สำเร็จ')),
  });
}

export function useFormReviewRecordSection(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      submissionId,
      sectionId,
      data,
    }: {
      submissionId: string;
      sectionId: string;
      data: RecordReviewRequest;
    }) => {
      const res = await formServicesRecordSectionReview({
        path: { id: submissionId, sectionId },
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.submission(variables.submissionId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.reviewDetail(variables.submissionId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.reviewQueue(companyId),
        }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'บันทึกผลตรวจหมวดไม่สำเร็จ')),
  });
}

export function useFormReviewFinalize(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      submissionId,
      data,
    }: {
      submissionId: string;
      data: FinalizeReviewRequest;
    }) => {
      const res = await formServicesFinalizeReview({
        path: { id: submissionId },
        body: data,
        throwOnError: true,
      });
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      toast.success('สรุปผลการพิจารณาสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.reviewDetail(variables.submissionId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.submission(variables.submissionId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.reviewQueue(companyId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.submissions(companyId),
        }),
        queryClient.invalidateQueries({
          queryKey: ['FORM', 'ASSIGNMENTS'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['FORM', 'OCCURRENCE'],
        }),
      ]);
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'สรุปผลการพิจารณาไม่สำเร็จ')),
  });
}
