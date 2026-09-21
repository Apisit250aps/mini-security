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
  useOrganizationAvailableFeaturesQueries,
  useRoleFeaturesQueries,
} from '@/modules/feature/hooks/feature-queries';

interface RoleFeatureManagerProps {
  role: Role;
  organizationId?: string;
  readOnly?: boolean;
}

export function RoleFeatureManager({
  role,
  organizationId,
  readOnly = false,
}: RoleFeatureManagerProps) {
  const orgId = organizationId || '';
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Only show features that THIS organization has active access to!
  const availableFeaturesQuery = useOrganizationAvailableFeaturesQueries(orgId);

  // 2. Query features assigned to this role
  const roleFeaturesQuery = useRoleFeaturesQueries(role.id);

  const assignMutation = useRoleFeatureAssign(role.id);
  const revokeMutation = useRoleFeatureRevoke(role.id, orgId);

  const availableFeatures = useMemo<Feature[]>(
    () => availableFeaturesQuery.data || [],
    [availableFeaturesQuery.data],
  );

  const assignedFeatureIds = useMemo(() => {
    return new Set(roleFeaturesQuery.data?.map((f) => f.id) || []);
  }, [roleFeaturesQuery.data]);

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

  const activeCount = useMemo(() => {
    let count = 0;
    for (const feat of availableFeatures) {
      if (assignedFeatureIds.has(feat.id)) {
        count++;
      }
    }
    return count;
  }, [availableFeatures, assignedFeatureIds]);

  const columns = useMemo<ColumnDef<Feature>[]>(
    () => [
      {
        id: 'toggle',
        header: 'มอบหมายสิทธิ์',
        cell: ({ row }) => {
          const feat = row.original;
          const isAssigned = assignedFeatureIds.has(feat.id);
          const isPending =
            (assignMutation.isPending &&
              assignMutation.variables?.featureId === feat.id) ||
            (revokeMutation.isPending && revokeMutation.variables === feat.id);

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
                      organizationId: orgId,
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
            <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
              ● มอบหมายแล้ว
            </span>
          ) : (
            <span className="inline-flex items-center text-xs text-muted-foreground">
              ○ ยังไม่ได้รับสิทธิ์
            </span>
          );
        },
      },
    ],
    [
      assignedFeatureIds,
      assignMutation,
      revokeMutation,
      readOnly,
      orgId,
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
          กำลังโหลดรายการฟีเจอร์ที่มอบหมายได้...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Overview Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">
              มอบหมายสิทธิ์ฟีเจอร์ให้บทบาท ({role.name})
            </h4>
            <p className="text-xs text-muted-foreground">
              พนักงานที่สังกัดบทบาทนี้จะสามารถเข้าถึงเมนูและฟังก์ชันของฟีเจอร์ที่เปิดใช้งานได้
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-normal">
            มอบหมายแล้ว {activeCount} จาก {availableFeatures.length}{' '}
            ฟีเจอร์ที่เปิดใช้ในองค์กร
          </Badge>
        </div>
      </div>

      {/* Search Bar */}
      <InputGroup className="w-full max-w-md">
        <InputGroupAddon align="inline-start">
          <Search className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="ค้นหาฟีเจอร์..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      {/* Features Table */}
      {availableFeatures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Layers className="size-8 opacity-40 mb-2" />
          <p className="text-sm font-medium">
            องค์กรนี้ยังไม่ได้รับสิทธิ์ในฟีเจอร์ใดๆ
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Super Admin
            จำเป็นต้องเปิดใช้งานฟีเจอร์ให้องค์กรก่อนจึงจะมอบหมายให้บทบาทได้
          </p>
        </div>
      ) : filteredFeatures.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Layers className="size-8 opacity-40 mb-2" />
          <p className="text-sm font-medium">ไม่พบฟีเจอร์ที่ตรงกับคำค้นหา</p>
        </div>
      ) : (
        <DataTable data={filteredFeatures} columns={columns} />
      )}
    </div>
  );
}

export default RoleFeatureManager;
