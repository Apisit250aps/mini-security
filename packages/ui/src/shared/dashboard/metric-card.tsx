"use client";

import * as React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "#components/card";
import { Skeleton } from "#components/skeleton";
import { cn } from "#lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

export interface MetricCardTrend {
  value: string | number;
  isPositive?: boolean;
  label?: string;
}

export interface MetricCardProps {
  title: string;
  value?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  trend?: MetricCardTrend;
  description?: React.ReactNode;
  footerAction?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
  iconClassName?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  description,
  footerAction,
  isLoading = false,
  className,
  iconClassName,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="size-8 rounded-lg" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-36" />
        </CardContent>
      </Card>
    );
  }

  const renderIcon = () => {
    if (!Icon) return null;
    if (React.isValidElement(Icon)) return Icon;
    if (typeof Icon === "function") {
      const IconComponent = Icon as React.ComponentType<{ className?: string }>;
      return (
        <div className="flex size-9 items-center justify-center rounded-lg border bg-muted/40 text-primary">
          <IconComponent className={cn("size-4.5 text-primary", iconClassName)} />
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:border-primary/40 hover:shadow-xs",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {renderIcon() && <CardAction>{renderIcon()}</CardAction>}
      </CardHeader>
      <CardContent className="flex flex-col gap-2 pt-0">
        <div className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {value ?? 0}
        </div>

        {(trend || description) && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 font-medium",
                  trend.isPositive !== false
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive",
                )}
              >
                {trend.isPositive !== false ? (
                  <ArrowUpRight className="size-3.5 shrink-0" />
                ) : (
                  <ArrowDownRight className="size-3.5 shrink-0" />
                )}
                {trend.value}
              </span>
            )}
            {trend?.label && <span>{trend.label}</span>}
            {trend && description && <span>•</span>}
            {description && <div>{description}</div>}
          </div>
        )}

        {footerAction && <div className="pt-1">{footerAction}</div>}
      </CardContent>
    </Card>
  );
}
