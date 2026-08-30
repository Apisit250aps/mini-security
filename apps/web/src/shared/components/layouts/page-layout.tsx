import React from 'react';
import { pageConfigs, PageConfigId } from '@/configs/contains/page-configs';

interface PageLayoutProps extends React.ComponentProps<'section'> {
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
  ...props
}: PageLayoutProps) {
  const page = pageId ? pageConfigs[pageId] : undefined;
  return (
    <section>
      <div className="flex flex-col gap-2 mb-2 lg:mb-4">
        <div className="flex items-center justify-between gap-4">
          <div id="page-header" className="space-y-2 lg:space-y-4 ">
            <h1 className="text-2xl lg:text-4xl font-semibold">
              {page?.title || title}
            </h1>
          </div>
          <div id="page-actions" className="">
            {props.actions}
          </div>
        </div>
        <p className="text-md lg:text-lg text-muted-foreground">
          {description || page?.description}
        </p>
      </div>
      <section {...props}>{children}</section>
    </section>
  );
}
