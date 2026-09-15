'use client';

import React, { useMemo, useState } from 'react';
import type { Feature, Role } from '@repo/client';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { Badge } from '@repo/ui/components/badge';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@repo/ui/components/input-group';
import { Spinner } from '@repo/ui/components/spinner';
import { Switch } from '@repo/ui/components/switch';
import { Layers, Search, ShieldCheck } from 'lucide-react';
import {
  useRoleFeatureAssign,
  useRoleFeatureRevoke,
} from '@/modules/feature/hooks/feature-mutations';
import {
  useCompanyAvailableFeaturesQueries,
  useRoleFeaturesQueries,
} from '@/modules/feature/hooks/feature-queries';

interface RoleFeatureManagerProps {
  role: Role;
  companyId: string;
  readOnly?: boolean;
}

export function RoleFeatureManager({
  role,
  companyId,
  readOnly = false,
}: RoleFeatureManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Only show features that THIS company has active access to!
  const availableFeaturesQuery = useCompanyAvailableFeaturesQueries(companyId);

  // 2. Query features assigned to this role
  const roleFeaturesQuery = useRoleFeaturesQueries(role.id);

  const assignMutation = useRoleFeatureAssign(role.id);
  const revokeMutation = useRoleFeatureRevoke(role.id, companyId);

  const availableFeatures = useMemo<Feature[]>(
    () => availableFeaturesQuery.data || [],
    [availableFeaturesQuery.data],
  );

  const assignedRoleFeatures = useMemo<Feature[]>(
    () => roleFeaturesQuery.data || [],
    [roleFeaturesQuery.data],
  );

  const assignedFeatureIds = useMemo(
    () => new Set(assignedRoleFeatures.map((f) => f.id)),
    [assignedRoleFeatures],
  );

  const filteredFeatures = useMemo(() => {
    if (!searchTerm.trim()) return availableFeatures;
    const term = searchTerm.toLowerCase();
    return availableFeatures.filter(
      (f) =>
        f.name.toLowerCase().includes(term) ||
        f.code.toLowerCase().includes(term) ||
        f.category.toLowerCase().includes(term) ||
        (f.description && f.description.toLowerCase().includes(term)),
    );
  }, [availableFeatures, searchTerm]);

  const columns = useMemo<ColumnDef<Feature>[]>(
    () => [
      {
        id: 'toggle',
        header: 'มอบหมาย',
        cell: ({ row }) => {
          const feat = row.original;
          const isAssigned = assignedFeatureIds.has(feat.id);
          const isPending =
            (assignMutation.isPending &&
              assignMutation.variables?.featureId === feat.id) ||
            (revokeMutation.isPending &&
              revokeMutation.variables === feat.id);

          return (
            <div className="flex items-center gap-2">
              {isPending && (
                <Spinner className="size-3.5 text-primary animate-spin" />
              )}
              <Switch
                isSelected={isAssigned}
                isDisabled={readOnly || isPending}
                onChange={(nextVal) => {
                  if (nextVal) {
                    assignMutation.mutate({
                      companyId,
                      roleId: role.id,
                      featureId: feat.id,
                      isEnabled: true,
                    });
                  } else {
                    revokeMutation.mutate(feat.id);
                  }
                }}
              />
            </div>
          );
        },
      },
      {
        accessorKey: 'name',
        header: 'ชื่อฟีเจอร์',
        cell: ({ row }) => {
          const feat = row.original;
          return (
            <div className="flex flex-col py-1">
              <span className="font-semibold text-sm text-foreground">
                {feat.name}
              </span>
              {feat.description && (
                <span className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {feat.description}
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'code',
        header: 'รหัสฟีเจอร์',
        cell: ({ getValue }) => (
          <Badge variant="outline" className="font-mono text-xs">
            {getValue<string>()}
          </Badge>
        ),
      },
      {
        accessorKey: 'category',
        header: 'หมวดหมู่',
        cell: ({ getValue }) => (
          <Badge variant="secondary" className="text-xs">
            {getValue<string>() || 'GENERAL'}
          </Badge>
        ),
      },
      {
        id: 'status',
        header: 'สถานะ',
        cell: ({ row }) => {
          const isAssigned = assignedFeatureIds.has(row.original.id);
          return isAssigned ? (
            <Badge variant="default" className="text-xs font-normal">
              มอบหมายแล้ว
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-muted-foreground font-normal">
              ยังไม่มอบหมาย
            </Badge>
          );
        },
      },
    ],
    [
      assignedFeatureIds,
      assignMutation,
      revokeMutation,
      readOnly,
      companyId,
      role.id,
    ],
  );

  const isLoading =
    availableFeaturesQuery.isLoading || roleFeaturesQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <Spinner className="size-6 text-primary" />
        <span className="text-sm text-muted-foreground">
          กำลังโหลดรายการฟีเจอร์สำหรับบทบาท...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
      {readOnly && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
          <span className="font-semibold">
            บทบาทมาตรฐานของระบบ (System Default):
          </span>{' '}
          แสดงข้อมูลฟีเจอร์ในโหมดดูข้อมูลเท่านั้น
        </div>
      )}

      {/* Role Summary Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3.5">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="size-5 text-primary" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">
              มอบหมายฟีเจอร์ให้บทบาท: {role.name}
            </span>
            <span className="text-xs text-muted-foreground">
              กำหนดว่าผู้ใช้ในบทบาทนี้
              สามารถเข้าถึงและดูแลฟีเจอร์ใดขององค์กรได้บ้าง
            </span>
          </div>
        </div>

        <Badge variant="outline" className="text-xs">
          ดูแล {assignedFeatureIds.size} จาก {availableFeatures.length}{' '}
          ฟีเจอร์ที่บริษัทมี
        </Badge>
      </div>

      {/* Search Input */}
      <InputGroup className="w-full">
        <InputGroupAddon align="inline-start">
          <Search className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="ค้นหาฟีเจอร์ที่ต้องการมอบหมาย..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {/* Feature List Table */}
      {availableFeatures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground rounded-lg border border-dashed">
          <Layers className="size-8 opacity-40 mb-2" />
          <p className="text-sm font-medium">
            บริษัทนี้ยังไม่ได้รับสิทธิ์ฟีเจอร์ใดจาก Super Admin
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            โปรดติดต่อ Super Admin เพื่อเปิดใช้งานฟีเจอร์ก่อนทำการมอบหมายบทบาท
          </p>
        </div>
      ) : filteredFeatures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <p className="text-sm">ไม่พบฟีเจอร์ที่ตรงกับคำค้นหา</p>
        </div>
      ) : (
        <DataTable data={filteredFeatures} columns={columns} />
      )}
    </div>
  );
}

export default RoleFeatureManager;
