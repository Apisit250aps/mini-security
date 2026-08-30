import React from 'react';
import { Button } from '#components/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#components/dropdown-menu';
import { Eye, MoreHorizontal, Pen, Trash2 } from 'lucide-react';

export interface ColumnActionsProps<T> {
  actions?: {
    view?: (data: T) => void;
    edit?: (id: string, data: T) => void;
    delete?: (id: string) => void;
  };
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
        {actions?.view && (
          <DropdownMenuItem textValue="ดู" onAction={() => actions.view}>
            <Eye className="size-4" />
            <span>ดู</span>
          </DropdownMenuItem>
        )}
        {actions?.edit && (
          <DropdownMenuItem textValue="แก้ไข" onAction={() => actions.edit}>
            <Pen className="size-4" />
            <span>แก้ไข</span>
          </DropdownMenuItem>
        )}
        {actions?.delete && (
          <DropdownMenuItem
            variant="destructive"
            textValue="ลบ"
            onAction={() => actions.delete}
          >
            <Trash2 className="size-4" />
            <span>ลบ</span>
          </DropdownMenuItem>
        )}
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
}

export default ColumnActions;
