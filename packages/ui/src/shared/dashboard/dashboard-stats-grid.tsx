"use client";

import * as React from "react";
import { cn } from "#lib/utils";

export interface DashboardStatsGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4;
  children: React.ReactNode;
}

const columnClasses: Record<number, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
};

export function DashboardStatsGrid({
  columns = 4,
  className,
  children,
  ...props
}: DashboardStatsGridProps) {
  return (
    <div
      className={cn("grid gap-4", columnClasses[columns] || columnClasses[4], className)}
      {...props}
    >
      {children}
    </div>
  );
}
