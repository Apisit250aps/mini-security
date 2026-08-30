import React from 'react';
import {
  pageConfigs,
  type PageConfigId,
} from '@/configs/contains/page-configs';

interface PageLayoutProps extends React.ComponentProps<'div'> {
  pageId?: PageConfigId | '';
  children?: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
}

export default function PageLayout({
  pageId,
  children,
  title,
  description,
  actions,
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
      <div {...props}>{children}</div>
    </section>
  );
}
