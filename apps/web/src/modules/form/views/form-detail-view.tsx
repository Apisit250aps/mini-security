'use client';

import React, { useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import {
  useFormTemplateQueries,
  useFormPlansQueries,
} from '../hooks/form-queries';
import {
  useFormTemplateUpdate,
  useFormPlanActivate,
  useFormPlanPause,
} from '../hooks/form-mutations';
import type { FormPlan } from '@repo/domains/entities';
import { Badge } from '@repo/ui/components/badge';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@repo/ui/components/tabs';
import {
  FileText,
  Layers,
  Calendar,
  Settings2,
  ArrowLeft,
  Eye,
  Edit3,
  CheckCircle2,
  Clock,
  HelpCircle,
  FolderOpen,
  Plus,
  Play,
  Pause,
} from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import Link from 'next/link';
import { buildPageUrl } from '@/shared/utils';
import { useOverlay } from '@repo/ui/hooks';
import { toast } from '@repo/ui/components/sonner';
import { getErrorMessage } from '@/shared/utils';
import { formatDate, formatDateTime } from '@/shared/utils/date';
import {
  MetricCard,
  DashboardStatsGrid,
} from '@repo/ui/components/shared/dashboard';

// Import views/components for each tab
import FormBuilderView from './form-builder-view';
import FormTemplatePreviewDialog from '../components/template/form-template-preview-dialog';
import FormTemplateForm, {
  type FormTemplateFormValues,
} from '../components/template/form-template-form';

interface FormDetailViewProps {
  templateId: string;
}

function PlanItemCard({
  plan,
  companyId,
}: {
  plan: FormPlan;
  companyId: string;
}) {
  const router = useRouter();
  const activateMutation = useFormPlanActivate(companyId, plan.id);
  const pauseMutation = useFormPlanPause(companyId, plan.id);

  const isActive = Boolean(plan.effectiveFrom && !plan.effectiveUntil);
  const isPaused = Boolean(plan.effectiveUntil);

  const cfg = plan.scheduleConfig as Record<string, unknown> | null;
  const frequency = (cfg?.frequency as string) || 'DAILY';
  const openLocalTime = (cfg?.openLocalTime as string) || '08:00';
  const dueOffset = cfg?.dueOffset as { amount?: number } | undefined;
  const dueHours = dueOffset?.amount || 8;

  return (
    <div className="p-5 border rounded-xl bg-card space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <Calendar className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-base">{plan.name}</h4>
          {isActive ? (
            <Badge
              variant="default"
              className="text-xs bg-emerald-600 hover:bg-emerald-700"
            >
              เปิดใช้งาน (Active)
            </Badge>
          ) : isPaused ? (
            <Badge variant="secondary" className="text-xs">
              ระงับชั่วคราว (Paused)
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-xs border-amber-400 text-amber-600"
            >
              ฉบับร่าง (Draft)
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            v{plan.revision}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => router.push(`/company/forms/plans/${plan.id}`)}
          >
            <Settings2 className="w-3.5 h-3.5" />
            ดูรายละเอียดและการตั้งค่าแผน
          </Button>

          {isActive ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-amber-600 border-amber-300 hover:bg-amber-50"
              onClick={() =>
                pauseMutation.mutate({ expectedRevision: plan.revision })
              }
              isDisabled={pauseMutation.isPending}
            >
              <Pause className="w-3.5 h-3.5" />
              ระงับแผน (Pause)
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
              onClick={() =>
                activateMutation.mutate({ expectedRevision: plan.revision })
              }
              isDisabled={activateMutation.isPending}
            >
              <Play className="w-3.5 h-3.5" />
              เปิดใช้งาน (Activate)
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground pt-1">
        <div>
          <span className="font-medium text-foreground">กำหนดเวลา: </span>
          {plan.scheduleKind === 'RECURRING'
            ? `ทำซ้ำ ${frequency} เวลา ${openLocalTime} น. (ส่งภายใน ${dueHours} ชม.)`
            : 'กำหนดช่วงเวลาเฉพาะ (Explicit)'}
        </div>
        <div>
          <span className="font-medium text-foreground">โหมดตรวจ: </span>
          รอผู้ตรวจอนุมัติ
        </div>
        <div>
          <span className="font-medium text-foreground">ส่งเกินเวลา: </span>
          {plan.latePolicy === 'ALLOW' ? 'อนุญาต (ALLOW)' : 'ห้ามส่งช้า (DENY)'}
        </div>
      </div>
    </div>
  );
}

export default function FormDetailView({ templateId }: FormDetailViewProps) {
  const { activeCompanyId, isLoading: isCompanyLoading } = useActiveCompany();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ui = useOverlay();

  const activeTab = searchParams.get('tab') || 'overview';

  const templateQuery = useFormTemplateQueries(templateId);
  const plansQuery = useFormPlansQueries(activeCompanyId || '', templateId);
  const detail = templateQuery.data;
  const template = detail?.template;
  const draftVersion = detail?.draftVersion;
  const activeVersion = detail?.activeVersion;
  const sections = detail?.sections || [];
  const fields = detail?.fields || [];
  const plans = plansQuery.data || [];

  const updateMutation = useFormTemplateUpdate(
    activeCompanyId || '',
    templateId,
  );

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleCreatePlan = useCallback(() => {
    if (!template) return;
    router.push(`/company/forms/plans/new?templateId=${template.id}`);
  }, [router, template]);

  const handlePreview = useCallback(() => {
    if (!template) return;
    ui.dialog.open({
      title: 'ตัวอย่างโครงสร้างแบบฟอร์ม',
      description: template.name,
      size: 'lg',
      children: (
        <FormTemplatePreviewDialog
          templateId={template.id}
          onClose={() => ui.dialog.close()}
        />
      ),
    });
  }, [ui.dialog, template]);

  const handleSettingsSubmit = useCallback(
    (values: FormTemplateFormValues) => {
      updateMutation.mutate(
        {
          name: values.name,
          description: values.description || null,
          isActive: values.isActive,
        },
        {
          onSuccess: () => {
            toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
          },
          onError: (err) => {
            toast.error(getErrorMessage(err, 'ไม่สามารถบันทึกการตั้งค่าได้'));
          },
        },
      );
    },
    [updateMutation],
  );

  const isPageLoading =
    isCompanyLoading || !activeCompanyId || templateQuery.isLoading;

  return (
    <PageLayout
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลฟอร์ม..."
      actions={
        <div className="flex items-center gap-2">
          <Link href={buildPageUrl('companyFormTemplates')}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              กลับหน้ารายการ
            </Button>
          </Link>
        </div>
      }
    >
      {!template ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <p className="text-muted-foreground">ไม่พบข้อมูลแบบฟอร์มที่ระบุ</p>
          <Link href={buildPageUrl('companyFormTemplates')}>
            <Button variant="outline">กลับหน้ารายการแบบฟอร์ม</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold tracking-tight">
                    {template.name}
                  </h2>
                  <Badge
                    variant={template.isActive ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {template.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </Badge>
                  {draftVersion ? (
                    <Badge
                      variant="outline"
                      className="border-amber-500/40 text-amber-600 bg-amber-50 text-xs"
                    >
                      ฉบับร่าง v{draftVersion.version}
                    </Badge>
                  ) : activeVersion ? (
                    <Badge
                      variant="outline"
                      className="border-emerald-500/40 text-emerald-600 bg-emerald-50 text-xs"
                    >
                      เผยแพร่แล้ว v{activeVersion.version}
                    </Badge>
                  ) : null}
                </div>
                {template.description && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
                    {template.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handlePreview}
              >
                <Eye className="w-4 h-4" />
                ดูตัวอย่างฟอร์ม
              </Button>
              <Button
                variant="default"
                size="sm"
                className="gap-1.5"
                onClick={() => handleTabChange('builder')}
              >
                <Edit3 className="w-4 h-4" />
                ออกแบบคำถาม
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            selectedKey={activeTab}
            onSelectionChange={(key) => handleTabChange(String(key))}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 max-w-xl">
              <TabsTrigger id="overview" className="gap-2">
                <FileText className="size-4" />
                ภาพรวม
              </TabsTrigger>
              <TabsTrigger id="builder" className="gap-2">
                <Layers className="size-4" />
                คำถาม ({fields.length})
              </TabsTrigger>
              <TabsTrigger id="plans" className="gap-2">
                <Calendar className="size-4" />
                แผนการตรวจ ({plans.length})
              </TabsTrigger>
              <TabsTrigger id="info" className="gap-2">
                <Edit3 className="size-4" />
                ข้อมูลแม่แบบ
              </TabsTrigger>
            </TabsList>

            <div className="pt-6">
              {/* Tab 1: Overview */}
              <TabsContent id="overview" className="mt-0 space-y-6">
                <DashboardStatsGrid columns={3}>
                  <MetricCard
                    title="เวอร์ชันเผยแพร่"
                    value={
                      activeVersion
                        ? `v${activeVersion.version}`
                        : 'ยังไม่เผยแพร่'
                    }
                    icon={CheckCircle2}
                    description={
                      activeVersion?.publishedAt
                        ? `เผยแพร่เมื่อ ${formatDate(activeVersion.publishedAt)}`
                        : 'สร้างหมวดหมู่และคำถามให้ครบถ้วนก่อนเผยแพร่'
                    }
                  />
                  <MetricCard
                    title="หมวดหมู่คำถาม (Sections)"
                    value={`${sections.length} หมวดหมู่`}
                    icon={FolderOpen}
                    description="กลุ่มของคำถามในการตรวจประเมิน"
                  />
                  <MetricCard
                    title="จำนวนข้อคำถาม (Fields)"
                    value={`${fields.length} คำถาม`}
                    icon={HelpCircle}
                    description="รายการข้อมูลที่ผู้ปฏิบัติงานต้องบันทึก"
                  />
                </DashboardStatsGrid>

                {/* Structure Breakdown Card */}
                <div className="border rounded-xl p-5 bg-card space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-base">
                        โครงสร้างแบบฟอร์ม
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        หมวดหมู่และข้อคำถามในแบบฟอร์มปัจจุบัน
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTabChange('builder')}
                    >
                      จัดการคำถามในแท็บ Builder
                    </Button>
                  </div>

                  {sections.length === 0 ? (
                    <div className="py-8 text-center border rounded-lg border-dashed">
                      <p className="text-sm text-muted-foreground">
                        ยังไม่มีหมวดหมู่และคำถามในแบบฟอร์มนี้
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-1"
                        onClick={() => handleTabChange('builder')}
                      >
                        เริ่มต้นเพิ่มคำถามในแท็บ &quot;คำถาม&quot;
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sections.map((sec, idx) => {
                        const secFields = fields.filter(
                          (f) => f.formSectionId === sec.id,
                        );
                        return (
                          <div
                            key={sec.id}
                            className="p-3 border rounded-lg bg-muted/20 flex flex-col gap-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {idx + 1}. {sec.title}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {secFields.length} คำถาม
                              </Badge>
                            </div>
                            {sec.description && (
                              <p className="text-xs text-muted-foreground">
                                {sec.description}
                              </p>
                            )}
                            {secFields.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-1">
                                {secFields.map((f) => (
                                  <span
                                    key={f.id}
                                    className="text-[11px] px-2 py-0.5 rounded bg-background border text-muted-foreground"
                                  >
                                    {f.label} ({f.type})
                                    {f.isRequired && (
                                      <span className="text-destructive ml-0.5">
                                        *
                                      </span>
                                    )}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Info & Timestamps */}
                <div className="flex items-center gap-6 text-xs text-muted-foreground border-t pt-4">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>สร้างเมื่อ: {formatDate(template.createdAt)}</span>
                  </div>
                  {template.updatedAt && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        อัปเดตล่าสุด: {formatDate(template.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Tab 2: Builder */}
              <TabsContent id="builder" className="mt-0">
                <FormBuilderView templateId={templateId} />
              </TabsContent>

              {/* Tab 3: Plans */}
              <TabsContent id="plans" className="mt-0 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                  <div>
                    <h3 className="font-semibold text-base">
                      แผนการตรวจที่ใช้แม่แบบนี้ ({plans.length} แผน)
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      การตั้งค่ารอบเวลาตรวจ ผู้รับผิดชอบ และนโยบายการตรวจรับ
                      ถูกกำหนดในแผนการตรวจ
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1.5"
                    onClick={handleCreatePlan}
                  >
                    <Plus className="w-4 h-4" />
                    สร้างและตั้งค่าแผนการตรวจใหม่
                  </Button>
                </div>

                {plans.length === 0 ? (
                  <div className="py-12 text-center border rounded-xl border-dashed bg-muted/10 space-y-3">
                    <Calendar className="w-10 h-10 text-muted-foreground mx-auto" />
                    <div>
                      <h4 className="font-medium text-sm">
                        ยังไม่มีแผนการตรวจที่ใช้แบบฟอร์มนี้
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                        สร้างแผนการตรวจเพื่อกำหนดว่าใครจะเป็นผู้รับผิดชอบกรอกฟอร์มนี้
                        พร้อมระบุรอบเวลาการทำงานและโหมดตรวจรับ
                      </p>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="gap-1.5"
                      onClick={handleCreatePlan}
                    >
                      <Plus className="w-4 h-4" />
                      สร้างและตั้งค่าแผนการตรวจใหม่
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plans.map((p) => (
                      <PlanItemCard
                        key={p.id}
                        plan={p}
                        companyId={activeCompanyId || ''}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab 4: Template Info */}
              <TabsContent id="info" className="mt-0">
                <div className="border rounded-xl p-6 bg-card max-w-2xl">
                  <h3 className="font-semibold text-base mb-1">
                    ข้อมูลแม่แบบฟอร์ม
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    ปรับปรุงชื่อและคำอธิบายแม่แบบฟอร์ม
                    (สำหรับการตั้งค่ารอบเวลาตรวจและผู้รับผิดชอบ ให้ไปที่แท็บ
                    &quot;แผนการตรวจ&quot;)
                  </p>
                  <FormTemplateForm
                    defaultValues={{
                      name: template.name,
                      description: template.description || '',
                      isActive: template.isActive,
                    }}
                    onSubmit={handleSettingsSubmit}
                    isLoading={updateMutation.isPending}
                    submitLabel="บันทึกข้อมูลแม่แบบ"
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </PageLayout>
  );
}
