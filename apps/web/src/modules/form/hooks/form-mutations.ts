import {
  formServicesEditField,
  formServicesDeleteField,
  type EditFormField,
} from '@repo/client';
import {
  formServicesReorderSections,
  formServicesReorderFields,
} from '@repo/client';
import type { FormTemplateDetail, ReorderFormItemsRequest } from '@repo/client';
import {
  formServicesAssignRoles,
  formServicesClone,
  formServicesCreateField,
  formServicesCreateSection,
  formServicesCreateTemplate,
  formServicesPublishVersion,
  formServicesReview,
  formServicesSaveDraft,
  formServicesStartSubmission,
  formServicesSubmit,
  formServicesUpdateTemplate,
} from '@repo/client';
import type {
  AssignFormRolesRequest,
  CloneFormSubmissionRequest,
  CreateFormField,
  CreateFormSection,
  CreateFormTemplate,
  PublishFormVersionRequest,
  ReviewFormSubmissionRequest,
  SaveFormSubmissionDraftRequest,
  StartFormSubmissionRequest,
  SubmitFormSubmissionRequest,
  UpdateFormTemplate,
} from '@repo/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@repo/ui/components/sonner';
import { formKeys, getErrorMessage } from '@/shared/utils';

export function useFormTemplateCreate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFormTemplate) => {
      const res = await formServicesCreateTemplate({ body: data });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('สร้างเทมเพลตแบบฟอร์มสำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: formKeys.templates(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการสร้างเทมเพลตแบบฟอร์ม'),
      );
    },
  });
}

export function useFormTemplateUpdate(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFormTemplate;
    }) => {
      const res = await formServicesUpdateTemplate({
        path: { id },
        body: data,
      });
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      toast.success('อัปเดตเทมเพลตแบบฟอร์มสำเร็จ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.templates(companyId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.template(variables.id),
        }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการอัปเดตเทมเพลตแบบฟอร์ม'),
      );
    },
  });
}

export function useFormRolesAssign(companyId: string, templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: AssignFormRolesRequest) => {
      const res = await formServicesAssignRoles({
        path: { id: templateId },
        body,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('กำหนดสิทธิ์ตำแหน่งเรียบร้อย');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.templates(companyId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.template(templateId),
        }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการกำหนดสิทธิ์ตำแหน่ง'),
      );
    },
  });
}

export function useFormSectionCreate(companyId: string, templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFormSection) => {
      const res = await formServicesCreateSection({
        path: { id: templateId },
        body: data,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('เพิ่มหมวดหมู่คำถามสำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: formKeys.template(templateId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการเพิ่มหมวดหมู่คำถาม'),
      );
    },
  });
}

export function useFormFieldCreate(companyId: string, templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateFormField) => {
      const res = await formServicesCreateField({
        path: { id: templateId },
        body: data,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('เพิ่มคำถามสำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: formKeys.template(templateId),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการเพิ่มคำถาม'));
    },
  });
}

export function useFormVersionPublish(companyId: string, templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: PublishFormVersionRequest) => {
      const res = await formServicesPublishVersion({
        path: { id: templateId },
        body,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('เผยแพร่เวอร์ชันแบบฟอร์มสำเร็จ พร้อมใช้งาน');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.templates(companyId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.template(templateId),
        }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, 'เกิดข้อผิดพลาดในการเผยแพร่แบบฟอร์ม'));
    },
  });
}

export function useFormSubmissionStart(companyId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: StartFormSubmissionRequest) => {
      const res = await formServicesStartSubmission({ body: data });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('เริ่มต้นการบันทึกแบบฟอร์มแล้ว');
      await queryClient.invalidateQueries({
        queryKey: formKeys.submissions(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการเริ่มบันทึกแบบฟอร์ม'),
      );
    },
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
          queryKey: formKeys.submissions(companyId),
        }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(
          error,
          'เกิดข้อผิดพลาดในการบันทึกฉบับร่าง (แบบฟอร์มอาจถูกแก้ไขโดยผู้อื่นแล้ว)',
        ),
      );
    },
  });
}

export function useFormSubmissionSubmit(
  submissionId: string,
  companyId?: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SubmitFormSubmissionRequest) => {
      const res = await formServicesSubmit({
        path: { id: submissionId },
        body: data,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('ส่งแบบฟอร์มเรียบร้อยแล้ว รอการอนุมัติ');
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.submission(submissionId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.submissions(companyId),
        }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(
          error,
          'เกิดข้อผิดพลาดในการส่งแบบฟอร์ม (โปรดตรวจสอบข้อมูลอีกครั้ง)',
        ),
      );
    },
  });
}

export function useFormSubmissionClone(companyId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: CloneFormSubmissionRequest;
    }) => {
      const res = await formServicesClone({
        path: { id },
        body: data,
      });
      return res.data;
    },
    onSuccess: async () => {
      toast.success('คัดลอกสร้างฉบับแก้ไขเรียบร้อยแล้ว');
      await queryClient.invalidateQueries({
        queryKey: formKeys.submissions(companyId),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, 'เกิดข้อผิดพลาดในการคัดลอกแบบฟอร์มฉบับแก้ไข'),
      );
    },
  });
}

export function useFormSubmissionReview(
  submissionId: string,
  companyId?: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ReviewFormSubmissionRequest) => {
      const res = await formServicesReview({
        path: { id: submissionId },
        body: data,
      });
      return res.data;
    },
    onSuccess: async (_data, variables) => {
      const actionText = variables.action === 'APPROVE' ? 'อนุมัติ' : 'ปฏิเสธ';
      toast.success(`บันทึกผลการพิจารณา (${actionText}) สำเร็จ`);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: formKeys.submission(submissionId),
        }),
        queryClient.invalidateQueries({
          queryKey: formKeys.submissions(companyId),
        }),
      ]);
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(
          error,
          'เกิดข้อผิดพลาดในการบันทึกผลพิจารณา (ผู้ยื่นไม่สามารถอนุมัติฟอร์มของตนเองได้)',
        ),
      );
    },
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

export function useFormFieldEdit(templateId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fieldId,
      data,
    }: {
      fieldId: string;
      data: EditFormField;
    }) =>
      (
        await formServicesEditField({
          path: { id: templateId, fieldId },
          body: data,
          throwOnError: true,
        })
      ).data,
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
    mutationFn: async (fieldId: string) =>
      (
        await formServicesDeleteField({
          path: { id: templateId, fieldId },
          throwOnError: true,
        })
      ).data,
    onSuccess: async () => {
      toast.success('ลบคำถามสำเร็จ');
      await queryClient.invalidateQueries({
        queryKey: formKeys.template(templateId),
      });
    },
    onError: (error) => toast.error(getErrorMessage(error, 'ลบคำถามไม่สำเร็จ')),
  });
}
