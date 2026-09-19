'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, FileText, Shield } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card';
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { InputField, TextareaField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { Checkbox } from '@repo/ui/components/checkbox';
import { toast } from '@repo/ui/components/sonner';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useSession } from '@/modules/auth/hooks/session-provider';
import { useCompanyMembersQueries } from '@/modules/company/hooks/company-queries';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import {
  useFormTemplateCreate,
  useFormTemplateUpdate,
} from '../hooks/form-mutations';
import { buildPageUrl, getErrorMessage } from '@/shared/utils';

const createFormSchema = z.object({
  name: z.string().min(1, 'กรุณาระบุชื่อแบบฟอร์ม'),
  description: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createFormSchema>;

export default function FormCreateView() {
  const router = useRouter();
  const { activeCompanyId, isLoading: isCompanyLoading } = useActiveCompany();
  const { data: session } = useSession();
  const membersQuery = useCompanyMembersQueries(activeCompanyId || '');
  const rolesQuery = useCompanyRolesQueries(activeCompanyId || '');

  const createMutation = useFormTemplateCreate(activeCompanyId || '');

  const currentMember = membersQuery.data?.find(
    (m) => m.userId === session?.user.id && m.isActive,
  );
  const createdBy = currentMember?.id || session?.user.id || '';

  const methods = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema as never),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleSubmit = useCallback(
    (values: CreateFormValues) => {
      if (!activeCompanyId) {
        toast.error('ไม่พบข้อมูลองค์กรที่กำลังใช้งาน');
        return;
      }

      createMutation.mutate(
        {
          companyId: activeCompanyId,
          name: values.name,
          description: values.description || null,
          isActive: true,
          createdBy,
        },
        {
          onSuccess: (res) => {
            const template = res?.data;
            if (!template) {
              toast.error('ไม่สามารถดึงข้อมูลแบบฟอร์มที่สร้างได้');
              return;
            }

            toast.success(
              'สร้างแบบฟอร์มสำเร็จ กำลังนำเข้าสู่หน้าออกแบบฟิลด์คำถาม',
            );
            router.push(`/company/forms/templates/${template.id}/builder`);
          },
          onError: (err) => {
            toast.error(getErrorMessage(err, 'ไม่สามารถสร้างแบบฟอร์มได้'));
          },
        },
      );
    },
    [activeCompanyId, createMutation, createdBy, router],
  );

  const isPageLoading = isCompanyLoading || !activeCompanyId;
  const roles = rolesQuery.data || [];

  return (
    <PageLayout
      pageId="companyFormCreate"
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลองค์กร..."
      actions={
        <Link href={buildPageUrl('companyFormTemplates')}>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับหน้ารายการแบบฟอร์ม
          </Button>
        </Link>
      }
    >
      <div className="max-w-3xl mx-auto py-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-3.5">
              <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-6" />
              </div>
              <div>
                <CardTitle className="text-xl">
                  สร้างแบบฟอร์มตรวจสอบใหม่
                </CardTitle>
                <CardDescription className="mt-1 text-sm text-muted-foreground">
                  กำหนดชื่อ คำอธิบาย
                  และสิทธิ์บทบาทที่ต้องการให้เริ่มกรอกแบบฟอร์มนี้
                  จากนั้นจะเข้าสู่หน้าออกแบบฟิลด์คำถามอย่างละเอียด
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={methods.handleSubmit(handleSubmit)}
              className="flex flex-col gap-6"
            >
              <FieldGroup className="flex flex-col gap-4">
                <InputField
                  name="name"
                  label="ชื่อแบบฟอร์ม (Form Name)"
                  placeholder="เช่น แบบฟอร์มตรวจความปลอดภัยประจำวัน, แบบตรวจสอบรถยนต์ขนส่ง"
                  control={methods.control}
                  required
                />

                <TextareaField
                  name="description"
                  label="คำอธิบายแบบฟอร์ม (Description)"
                  placeholder="ระบุวัตถุประสงค์ คำชี้แจง หรือข้อปฏิบัติในการกรอกแบบฟอร์มนี้..."
                  control={methods.control}
                  rows={3}
                />
              </FieldGroup>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <Link href={buildPageUrl('companyFormTemplates')}>
                  <Button variant="ghost" type="button">
                    ยกเลิก
                  </Button>
                </Link>

                <ButtonLoading
                  type="submit"
                  isLoading={createMutation.isPending}
                  className="gap-2"
                >
                  สร้างและเริ่มออกแบบคำถาม
                  <ArrowRight className="w-4 h-4" />
                </ButtonLoading>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
