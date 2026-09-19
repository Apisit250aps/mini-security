'use client';

import React from 'react';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@repo/ui/components/empty';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Empty
      className={cn(
        'min-h-64 border border-dashed border-border/80 bg-card/20',
        className,
      )}
    >
      <EmptyHeader>
        {Icon && (
          <EmptyMedia variant="icon">
            <Icon className="size-6 text-muted-foreground" />
          </EmptyMedia>
        )}
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </Empty>
  );
}
