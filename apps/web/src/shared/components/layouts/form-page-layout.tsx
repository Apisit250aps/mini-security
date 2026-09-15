'use client';

import React from 'react';
import { Card, CardContent } from '@repo/ui/components/card';
import { Spinner } from '@repo/ui/components/spinner';

export interface FormPageLayoutProps {
  title: string;
  description?: string;
  backHref?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  maxWidth?: 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full';
}

const MAX_WIDTH_MAP = {
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-5xl',
  '3xl': 'max-w-6xl',
  '4xl': 'max-w-7xl',
  full: 'w-full',
};

export default function FormPageLayout({
  title,
  description,
  badge,
  actions,
  isLoading = false,
  loadingText = 'กำลังโหลด...',
  children,
  sidebar,
  maxWidth = '2xl',
}: FormPageLayoutProps) {
  return (
    <div className={`mx-auto flex flex-col gap-6 ${MAX_WIDTH_MAP[maxWidth]}`}>
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/50 pb-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
                {title}
              </h1>
              {badge}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>

      {/* Main Form Content */}
      {isLoading ? (
        <Card>
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-3 p-8">
            <Spinner className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{loadingText}</p>
          </CardContent>
        </Card>
      ) : sidebar ? (
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">{children}</div>
          <div className="flex flex-col gap-6 lg:col-span-1">{sidebar}</div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
}
