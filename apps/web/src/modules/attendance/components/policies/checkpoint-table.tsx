'use client';

import React, { useMemo } from 'react';
import type { AttendancePolicy } from '@repo/domains/entities';
import { Button } from '@repo/ui/components/button';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useOverlay } from '@repo/ui/hooks';
import { Plus } from 'lucide-react';
import { useAttendanceCheckpointsQueries } from '../../hooks/attendance-queries';
import CheckpointForm from './checkpoint-form';
import { checkpointColumns } from './checkpoint-columns';

export default function CheckpointTable({
  companyId,
  policy,
}: {
  companyId: string;
  policy: AttendancePolicy;
}) {
  const ui = useOverlay();
  const { data = [], isLoading } = useAttendanceCheckpointsQueries(policy.id);
  const columns = useMemo(() => checkpointColumns({ companyId }), [companyId]);

  const table = useMemo(
    () => ({
      data,
      columns,
      isLoading,
    }),
    [data, columns, isLoading],
  );

  const handleCreate = () => {
    ui.dialog.open({
      title: 'เพิ่มจุดเช็คชื่อ',
      description: `สร้างจุดเช็คชื่อใหม่ภายใต้นโยบาย "${policy.name}"`,
      size: 'xl',
      children: <CheckpointForm policyId={policy.id} />,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onPress={handleCreate} size="sm">
          <Plus className="size-4" />
          เพิ่มจุดเช็คชื่อ
        </Button>
      </div>
      <DataTable {...table} />
    </div>
  );
}
