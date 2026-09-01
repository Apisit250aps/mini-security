import React from 'react';
import {
  pageConfigs,
  type PageConfigId,
} from '@/configs/contains/page-configs';
import { Spinner } from '@repo/ui/components/spinner';

interface PageLayoutProps extends React.ComponentProps<'div'> {
  pageId?: PageConfigId | '';
  children?: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
}

export default function PageLayout({
  pageId,
  children,
  title,
  description,
  actions,
  isLoading = false,
  loadingText,
  className,
  ...props
}: PageLayoutProps) {
  const page = pageId ? pageConfigs[pageId] : undefined;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-4">
          <div id="page-header">
            <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">
              {page?.title || title}
            </h1>
          </div>
          <div id="page-actions" className="flex items-center gap-2">
            {actions}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {description || page?.description}
        </p>
      </div>

      {isLoading ? (
        <div
          className="flex min-h-80 w-full flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card/30 p-8 text-center"
          role="status"
          aria-live="polite"
        >
          <div className="flex flex-col items-center gap-3">
            <Spinner className="size-6 text-muted-foreground" />
            <p className="text-sm font-medium text-muted-foreground">
              {loadingText || 'กำลังโหลดข้อมูล...'}
            </p>
          </div>
        </div>
      ) : (
        <div className={className} {...props}>
          {children}
        </div>
      )}
    </section>
  );
}
