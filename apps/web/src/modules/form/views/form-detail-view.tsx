'use client';

import React from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import PageLayout from '@/shared/components/layouts/page-layout';
import { useActiveCompany } from '@/modules/company-workspace/hooks/use-active-company';
import { useFormTemplateQueries } from '../hooks/form-queries';
import { Badge } from '@repo/ui/components/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@repo/ui/components/tabs';
import { FileText, Layers, Calendar, CalendarDays, Settings2, ArrowLeft } from 'lucide-react';
import { Button } from '@repo/ui/components/button';
import Link from 'next/link';
import { buildPageUrl } from '@/shared/utils';

// Import views/components for each tab
import FormBuilderView from './form-builder-view';

interface FormDetailViewProps {
  templateId: string;
}

export default function FormDetailView({ templateId }: FormDetailViewProps) {
  const { activeCompanyId, isLoading: isCompanyLoading } = useActiveCompany();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const activeTab = searchParams.get('tab') || 'overview';
  
  const templateQuery = useFormTemplateQueries(templateId);
  const detail = templateQuery.data;
  const template = detail?.template;
  const draftVersion = detail?.draftVersion;
  const activeVersion = detail?.activeVersion;
  
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const isPageLoading = isCompanyLoading || !activeCompanyId || templateQuery.isLoading;

  return (
    <PageLayout
      isLoading={isPageLoading}
      loadingText="กำลังโหลดข้อมูลฟอร์ม..."
      actions={
        <div className="flex items-center gap-2">
          <Link href={buildPageUrl('companyFormTemplates')}>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
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
                  <h2 className="text-xl font-semibold tracking-tight">{template.name}</h2>
                  <Badge variant={template.isActive ? 'default' : 'secondary'} className="text-xs">
                    {template.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                  </Badge>
                  {draftVersion ? (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-600 bg-amber-50 text-xs">
                      ฉบับร่าง v{draftVersion.version}
                    </Badge>
                  ) : activeVersion ? (
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 bg-emerald-50 text-xs">
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
          </div>

          {/* Tabs */}
          <Tabs selectedKey={activeTab} onSelectionChange={(key) => handleTabChange(String(key))} className="w-full">
            <TabsList className="w-full justify-start h-12 bg-transparent border-b rounded-none p-0">
              <TabsTrigger
                id="overview"
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none h-12 px-6"
              >
                <FileText className="w-4 h-4 mr-2" />
                ภาพรวม
              </TabsTrigger>
              <TabsTrigger
                id="builder"
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none h-12 px-6"
              >
                <Layers className="w-4 h-4 mr-2" />
                คำถาม
              </TabsTrigger>
              <TabsTrigger
                id="plans"
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none h-12 px-6"
              >
                <Calendar className="w-4 h-4 mr-2" />
                แผนงาน
              </TabsTrigger>
              <TabsTrigger
                id="occurrences"
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none h-12 px-6"
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                รอบงาน
              </TabsTrigger>
              <TabsTrigger
                id="settings"
                className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none h-12 px-6"
              >
                <Settings2 className="w-4 h-4 mr-2" />
                ตั้งค่า
              </TabsTrigger>
            </TabsList>

            <div className="pt-6">
              <TabsContent id="overview" className="mt-0">
                <div className="text-muted-foreground">เนื้อหาภาพรวม (Overview) กำลังพัฒนา...</div>
              </TabsContent>

              <TabsContent id="builder" className="mt-0">
                <FormBuilderView templateId={templateId} />
              </TabsContent>

              <TabsContent id="plans" className="mt-0">
                <div className="text-muted-foreground">เนื้อหาแผนงาน (Plans) กำลังพัฒนา...</div>
              </TabsContent>

              <TabsContent id="occurrences" className="mt-0">
                <div className="text-muted-foreground">เนื้อหารอบงาน (Occurrences) กำลังพัฒนา...</div>
              </TabsContent>

              <TabsContent id="settings" className="mt-0">
                <div className="text-muted-foreground">เนื้อหาตั้งค่า (Settings) กำลังพัฒนา...</div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </PageLayout>
  );
}
