'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  formServicesUploadAttachment,
  formServicesDeleteAttachment,
} from '@repo/client';
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { toast } from '@repo/ui/components/sonner';
import { useFormSubmissionQueries } from '../../hooks/form-queries';
import { formKeys } from '@/shared/utils/query';
import { getErrorMessage } from '@/shared/utils';

interface Props {
  submissionId: string;
  fieldId: string;
  image: boolean;
  disabled: boolean;
}

function FormAttachmentField({
  submissionId,
  fieldId,
  image,
  disabled,
}: Props) {
  const { data: detail } = useFormSubmissionQueries(submissionId);
  const queryClient = useQueryClient();
  const answer = detail?.answers.find((answer) => answer.fieldId === fieldId);
  const attachments =
    detail?.attachments.filter(
      (attachment) => attachment.answerId === answer?.id,
    ) ?? [];
  const mutation = useMutation({
    mutationKey: ['FORM', 'ATTACHMENT', submissionId],
    mutationFn: async (input: File | string) => {
      if (!detail) return;
      if (typeof input === 'string') {
        await formServicesDeleteAttachment({
          path: { attachmentId: input },
          body: { expectedRevision: detail.submission.revision },
          throwOnError: true,
        });
      } else {
        await formServicesUploadAttachment({
          path: { id: submissionId, fieldId },
          body: { file: input, expectedRevision: detail.submission.revision },
          throwOnError: true,
        });
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: formKeys.submission(submissionId),
      }),
    onError: (error) =>
      toast.error(getErrorMessage(error, 'บันทึกไฟล์แนบไม่สำเร็จ')),
  });
  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="flex items-center gap-2">
          <a
            className="text-sm underline"
            href={`/api/forms/attachments/${attachment.id}`}
            target="_blank"
            rel="noreferrer"
          >
            {attachment.originalName}
          </a>
          {!disabled && (
            <Button
              size="sm"
              variant="ghost"
              isDisabled={mutation.isPending}
              onPress={() => mutation.mutate(attachment.id)}
            >
              ลบ
            </Button>
          )}
        </div>
      ))}
      {!disabled && (
        <>
          <Input
            type="file"
            accept={
              image
                ? 'image/jpeg,image/png,image/webp'
                : '.pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.png,.jpg,.jpeg,.webp'
            }
            disabled={mutation.isPending || !detail}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) mutation.mutate(file);
              event.target.value = '';
            }}
          />
          <p className="text-xs text-muted-foreground">
            {mutation.isPending
              ? 'กำลังบันทึกไฟล์...'
              : `สูงสุด ${image ? 5 : 10} MB ต่อไฟล์ · ไม่เกิน 10 ไฟล์`}
          </p>
        </>
      )}
    </div>
  );
}

export function renderFormAttachmentField(props: Props) {
  return <FormAttachmentField {...props} />;
}
