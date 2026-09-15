'use client';

import { useId, type ReactNode } from 'react';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import type { FormReorderItem } from '@repo/client';

export function FormBuilderSortableList({
  items,
  disabled,
  onReorder,
  children,
}: {
  items: { id: string }[];
  disabled: boolean;
  onReorder: (items: FormReorderItem[]) => void;
  children: ReactNode;
}) {
  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  return (
    <DndContext
      id={id}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (disabled || !over || active.id === over.id) return;
        const from = items.findIndex((item) => item.id === active.id);
        const to = items.findIndex((item) => item.id === over.id);
        if (from < 0 || to < 0) return;
        onReorder(
          arrayMove(items, from, to).map((item, sortOrder) => ({
            id: item.id,
            sortOrder,
          })),
        );
      }}
    >
      <SortableContext
        items={items.map((item) => item.id)}
        strategy={verticalListSortingStrategy}
        disabled={disabled}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}

export function FormBuilderSortableItem({
  id,
  label,
  disabled,
  children,
}: {
  id: string;
  label: string;
  disabled: boolean;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        position: 'relative',
        zIndex: isDragging ? 10 : undefined,
        opacity: isDragging ? 0.7 : 1,
      }}
      className="flex items-start gap-2"
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`เปลี่ยนลำดับ ${label}`}
        disabled={disabled}
        className="mt-3 flex size-8 shrink-0 touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-30 enabled:cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
