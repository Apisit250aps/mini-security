'use client';

import { AttendanceLocationSelect } from './attendance-location-select';

import React, { useMemo, useState } from 'react';
import type { AttendanceCheckpoint } from '@repo/domains/entities';
import {
  useAttendanceLocationsQueries,
  useCheckpointLocationsQueries,
} from '../../hooks/attendance-queries';
import {
  useCheckpointLocationAssign,
  useCheckpointLocationRemove,
} from '../../hooks/attendance-mutations';
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { Badge } from '@repo/ui/components/badge';
import { MapPin, Plus, Trash2 } from 'lucide-react';

export default function CheckpointLocationDialog({
  companyId,
  checkpoint,
}: {
  companyId: string;
  checkpoint: AttendanceCheckpoint;
}) {
  const { data: allLocations = [], isLoading: isLocationsLoading } =
    useAttendanceLocationsQueries(companyId);
  const { data: assigned = [], isLoading: isAssignedLoading } =
    useCheckpointLocationsQueries(checkpoint.id);

  const assignMutation = useCheckpointLocationAssign(checkpoint.id);
  const removeMutation = useCheckpointLocationRemove(checkpoint.id);

  const [selectedLocationId, setSelectedLocationId] = useState<string>('');

  const assignedLocationIds = useMemo(
    () => new Set(assigned.map((a) => a.locationId)),
    [assigned],
  );

  const availableLocations = useMemo(
    () => allLocations.filter((loc) => !assignedLocationIds.has(loc.id)),
    [allLocations, assignedLocationIds],
  );

  const handleAssign = async () => {
    if (
      !availableLocations.some((location) => location.id === selectedLocationId)
    )
      return;
    await assignMutation.mutateAsync({
      checkpointId: checkpoint.id,
      locationId: selectedLocationId,
    });
    setSelectedLocationId('');
  };

  const handleRemove = async (locationId: string) => {
    await removeMutation.mutateAsync({
      checkpointId: checkpoint.id,
      locationId,
    });
  };

  const isLoading = isLocationsLoading || isAssignedLoading;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border p-3 bg-muted/20">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="size-4 text-primary" />
          <h4 className="text-xs font-semibold text-foreground">
            เพิ่มสถานที่สำหรับจุดเช็ค &quot;{checkpoint.label}&quot;
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <AttendanceLocationSelect
            companyId={companyId}
            excludeIds={assignedLocationIds}
            label="สถานที่ลงเวลา"
            value={selectedLocationId}
            onChange={setSelectedLocationId}
            disabled={isAssignedLoading || assignMutation.isPending}
          />
          <ButtonLoading
            size="sm"
            onPress={handleAssign}
            isDisabled={
              isLoading ||
              !availableLocations.some(
                (location) => location.id === selectedLocationId,
              )
            }
            isLoading={assignMutation.isPending}
            className="gap-1 h-9"
          >
            <Plus className="size-3.5" />
            ผูกสถานที่
          </ButtonLoading>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          สถานที่ที่อนุญาตให้ลงเวลา ({assigned.length})
        </h4>

        {isLoading ? (
          <div className="py-4 text-center text-xs text-muted-foreground">
            กำลังโหลดข้อมูลสถานที่...
          </div>
        ) : assigned.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
            ยังไม่ได้ผูกสถานที่ใดๆ (จะอนุญาตให้ลงเวลาได้ทุกที่ หากไม่ได้ระบุ)
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {assigned.map((item) => {
              const loc = allLocations.find((l) => l.id === item.locationId);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-md border p-2.5 bg-card/60 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="font-semibold text-foreground">
                      {loc ? loc.name : `Location ID: ${item.locationId}`}
                    </span>
                    {loc && (
                      <Badge variant="outline" className="text-[10px] py-0">
                        {loc.locationType} ({loc.radiusMeters || 0}m)
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 text-muted-foreground hover:text-destructive"
                    onPress={() => handleRemove(item.locationId)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
