'use client';

import React from 'react';
import { Card, CardContent } from '@repo/ui/components/card';
import { Badge } from '@repo/ui/components/badge';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@repo/ui/lib/utils';

export interface MetricStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon?: LucideIcon;
  badge?: string;
  className?: string;
}

export default function MetricStatCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  badge,
  className,
}: MetricStatCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden transition-all hover:shadow-xs',
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {Icon && (
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </div>
          )}
          {badge && <Badge variant="outline">{badge}</Badge>}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">
            {value}
          </span>
          {trend && (
            <Badge
              variant={trend.isPositive ? 'default' : 'destructive'}
              className="text-xs"
            >
              {trend.value}
            </Badge>
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
