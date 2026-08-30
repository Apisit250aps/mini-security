import React from 'react';
import { Button } from '#components/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#components/dropdown-menu';
import { Eye, MoreHorizontal, Pen, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';

type ActionItem = {
  onAction: () => void;
  icon?: ReactNode;
  variant?: 'destructive' | 'default';
};

export interface ColumnActionsProps<T> {
  actions: Record<string, ActionItem>;
}

function ColumnActions<T extends { id: string }>({
  actions,
}: ColumnActionsProps<T>) {
  return (
    <DropdownMenuTrigger>
      <Button variant="ghost" size="icon-sm" aria-label="Open actions menu">
        <MoreHorizontal className="size-4" />
      </Button>

      <DropdownMenu placement="bottom end">
        {Object.entries(actions).map(([label, action]) => (
          <DropdownMenuItem
            key={label}
            textValue={label}
            variant={action.variant}
            onAction={action.onAction}
          >
            {action.icon}
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
}

export default ColumnActions;