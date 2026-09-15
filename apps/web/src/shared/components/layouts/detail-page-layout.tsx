'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@repo/ui/components/button';
import { Spinner } from '@repo/ui/components/spinner';
import { ArrowLeft } from 'lucide-react';

export interface DetailPageLayoutProps {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  headerContent?: React.ReactNode;
}

export default function DetailPageLayout({
  title,
  description,
  backHref,
  backLabel = 'ย้อนกลับ',
  badges,
  actions,
  isLoading = false,
  loadingText = 'กำลังโหลดข้อมูล...',
  children,
  headerContent,
}: DetailPageLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Navigation and Header */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-5">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onPress={handleBack}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            <span className="text-sm">{backLabel}</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                {title}
              </h1>
              {badges}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </div>

        {headerContent && (
          <div className="mt-1">{headerContent}</div>
        )}
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex min-h-80 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/30 p-8 text-center">
          <Spinner className="size-6 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">{loadingText}</p>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}
