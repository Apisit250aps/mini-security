'use client';

import * as React from 'react';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#components/card';
import { Badge } from '#components/badge';
import { Skeleton } from '#components/skeleton';
import { cn } from '#lib/utils';

export interface ActivityItem {
  id: string | number;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  avatarText?: string;
  avatarUrl?: string;
  value?: React.ReactNode;
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
    className?: string;
  };
  timestamp?: string;
  onClick?: () => void;
}

export interface RecentActivityCardProps {
  title: string;
  description?: string;
  headerAction?: React.ReactNode;
  items: ActivityItem[];
  emptyMessage?: string;
  isLoading?: boolean;
  className?: string;
}

export function RecentActivityCard({
  title,
  description,
  headerAction,
  items,
  emptyMessage = 'ไม่มีกิจกรรมล่าสุด',
  isLoading = false,
  className,
}: RecentActivityCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {headerAction && <CardAction>{headerAction}</CardAction>}
      </CardHeader>
      <CardContent className="flex-1 pt-0">
        {isLoading ? (
          <div className="flex flex-col gap-3 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-4 w-3/5" />
                  <Skeleton className="h-3 w-2/5" />
                </div>
                <Skeleton className="h-4 w-12" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[140px] items-center justify-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {items.map((item) => (
              <li
                key={item.id}
                onClick={item.onClick}
                className={cn(
                  'flex items-center justify-between gap-3 py-3 transition-colors',
                  item.onClick &&
                    'cursor-pointer hover:bg-muted/40 -mx-4 px-4 rounded-lg',
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  {item.icon ? (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/30 text-foreground">
                      {item.icon}
                    </div>
                  ) : item.avatarUrl ? (
                    <img
                      src={item.avatarUrl}
                      alt=""
                      className="size-9 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {item.avatarText || '•'}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="truncate text-xs text-muted-foreground">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 text-right">
                  {item.value && (
                    <span className="text-sm font-medium text-foreground">
                      {item.value}
                    </span>
                  )}
                  {item.badge && (
                    <Badge
                      variant={item.badge.variant || 'secondary'}
                      className={item.badge.className}
                    >
                      {item.badge.label}
                    </Badge>
                  )}
                  {item.timestamp && (
                    <span className="text-xs text-muted-foreground">
                      {item.timestamp}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
