'use client';

import { useState } from 'react';
import type { Location, ScheduleSlot } from '@repo/client';
import { Button } from '@repo/ui/components/button';
import { Alert, AlertTitle, AlertDescription } from '@repo/ui/components/alert';
import { usePermission } from '@/modules/auth/hooks/permission-provider';
import { useOrganizationSitesQueries } from '@/modules/organization/hooks/organization-queries';
import {
  useListLocationsByOrganization,
  useSlotLocationAssignments,
} from '@/modules/location/hooks/location-queries';
import { useSlotLocationToggle } from '@/modules/location/hooks/location-mutations';
import LocationForm from '@/modules/location/components/location-form';
import LocationTable from '@/modules/location/components/location-table';

export default function SlotLocationsPanel({
  organizationId,
  slot,
  onBack,
}: {
  organizationId?: string;
  slot: ScheduleSlot;
  onBack: () => void;
}) {
  const targetOrgId = organizationId || '';
  const { hasPermission } = usePermission();
  const locations = useListLocationsByOrganization(targetOrgId);
  const sites = useOrganizationSitesQueries(targetOrgId);
  const assignments = useSlotLocationAssignments(targetOrgId, slot.id);
  const toggle = useSlotLocationToggle(targetOrgId, slot.id);
  const [editor, setEditor] = useState<Location | 'new' | null>(null);
  const canManageLocations = hasPermission('location:manage');
  const canManageSlot = hasPermission('attendance_schedule:manage');
  const hasError = locations.isError || sites.isError || assignments.isError;
  const loading =
    locations.isLoading || sites.isLoading || assignments.isLoading;
  const allowedCount = (assignments.data ?? []).filter(
    (assignment) =>
      assignment.isActive &&
      locations.data?.some(
        (location) =>
          location.id === assignment.locationId &&
          location.isActive &&
          sites.data?.some(
            (site) => site.id === location.siteId && site.isActive,
          ),
      ),
  ).length;

  if (editor)
    return (
      <LocationForm
        key={editor === 'new' ? 'new' : editor.id}
        organizationId={targetOrgId}
        location={editor === 'new' ? undefined : editor}
        onClose={() => setEditor(null)}
      />
    );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          variant="outline"
          onPress={onBack}
          isDisabled={toggle.isPending}
        >
          กลับไปรอบเวลา
        </Button>
        {canManageLocations ? (
          <Button
            onPress={() => setEditor('new')}
            isDisabled={toggle.isPending || loading || hasError}
          >
            เพิ่มสถานที่
          </Button>
        ) : null}
      </div>
      <h3>ตำแหน่งการเข้างาน · {slot.label}</h3>
      {loading ? (
        <p role="status">กำลังโหลดตำแหน่งการเข้างาน...</p>
      ) : hasError ? (
        <Alert variant="destructive">
          <AlertTitle>โหลดตำแหน่งการเข้างานไม่สำเร็จ</AlertTitle>
          <AlertDescription>
            <Button
              variant="outline"
              onPress={() => {
                void locations.refetch();
                void sites.refetch();
                void assignments.refetch();
              }}
            >
              ลองอีกครั้ง
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert
            variant={
              assignments.data?.length && allowedCount === 0
                ? 'destructive'
                : 'default'
            }
          >
            <AlertTitle>
              {assignments.data?.length
                ? `สถานที่ที่ใช้เช็คอินได้ ${allowedCount} แห่ง`
                : 'รอบนี้ยังไม่กำหนดพื้นที่เช็คอิน'}
            </AlertTitle>
            <AlertDescription>
              {assignments.data?.length
                ? 'เช็คอินได้เฉพาะสถานที่ที่เปิดใช้ในรอบนี้ และสถานที่กับไซต์/สาขาต้องเปิดใช้งานด้วย หากปิดทั้งหมดจะเช็คอินไม่ได้'
                : 'รอบที่ไม่เคยกำหนดสถานที่ลงเวลาได้โดยไม่ตรวจ GPS เมื่อเลือกสถานที่แล้วจะต้องตรวจพื้นที่ทุกครั้ง'}
            </AlertDescription>
          </Alert>
          <LocationTable
            locations={locations.data ?? []}
            sites={sites.data ?? []}
            actions={(location) => {
              const assignment = assignments.data?.find(
                (item) => item.locationId === location.id,
              );
              const siteActive = sites.data?.some(
                (site) => site.id === location.siteId && site.isActive,
              );
              return (
                <div className="flex flex-col gap-2">
                  <span>
                    {assignment?.isActive
                      ? 'เลือกใช้ในรอบนี้'
                      : assignment
                        ? 'ปิดใช้ในรอบนี้'
                        : 'ยังไม่เลือก'}
                  </span>
                  {canManageSlot ? (
                    <Button
                      size="sm"
                      variant="outline"
                      isDisabled={
                        toggle.isPending ||
                        assignments.isFetching ||
                        (!assignment?.isActive &&
                          (!location.isActive || !siteActive))
                      }
                      onPress={() =>
                        toggle.mutate({ locationId: location.id, assignment })
                      }
                    >
                      {assignment?.isActive
                        ? 'ปิดใช้ในรอบนี้'
                        : 'เลือกใช้ในรอบนี้'}
                    </Button>
                  ) : null}
                  {canManageLocations ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      isDisabled={toggle.isPending}
                      onPress={() => setEditor(location)}
                    >
                      แก้ไขสถานที่
                    </Button>
                  ) : null}
                </div>
              );
            }}
          />
        </>
      )}
    </div>
  );
}
