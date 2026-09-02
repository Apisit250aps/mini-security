'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAttendanceLocationSchema } from '@repo/domains/schema/attendance';
import type { z } from 'zod';
import {
  useAttendanceLocationCreate,
  useAttendanceLocationUpdate,
} from '../../hooks/attendance-mutations';
import { useOverlay } from '@repo/ui/hooks';
import { InputField } from '@repo/ui/components/shared/form/input-field';
import { SelectField } from '@repo/ui/components/shared/form/select-field';
import { TextareaField } from '@repo/ui/components/shared/form/textarea-field';
import { SwitchField } from '@repo/ui/components/shared/form/boolean-fields';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { FieldGroup } from '@repo/ui/components/field';
import type { AttendanceLocation } from '@repo/domains/entities';

type FormValues = z.infer<typeof createAttendanceLocationSchema>;

const LOCATION_TYPE_OPTIONS = [
  { value: 'RADIUS', label: 'รัศมี GPS (Radius Distance)' },
  { value: 'FIXED', label: 'พิกัดจุดเฉพาะ (Fixed Point)' },
  { value: 'BRANCH', label: 'ผูกกับสาขา (Company Branch)' },
];

export default function LocationForm({
  companyId,
  location,
}: {
  companyId: string;
  location?: AttendanceLocation;
}) {
  const ui = useOverlay();
  const createMutation = useAttendanceLocationCreate(companyId);
  const updateMutation = useAttendanceLocationUpdate(companyId);

  const isEdit = Boolean(location);

  const methods = useForm<FormValues>({
    resolver: zodResolver(createAttendanceLocationSchema as never),
    defaultValues: {
      companyId,
      branchId: location?.branchId || null,
      name: location?.name || '',
      locationType: location?.locationType || 'RADIUS',
      latitude: location?.latitude ?? 13756300,
      longitude: location?.longitude ?? 100501800,
      radiusMeters: location?.radiusMeters ?? 100,
      address: location?.address || '',
      isActive: location?.isActive ?? true,
    },
  });

  const handleSubmit = async (data: FormValues) => {
    if (isEdit && location) {
      await updateMutation.mutateAsync({
        id: location.id,
        data: {
          name: data.name,
          locationType: data.locationType,
          latitude: Number(data.latitude) || null,
          longitude: Number(data.longitude) || null,
          radiusMeters: Number(data.radiusMeters) || null,
          address: data.address || null,
          isActive: data.isActive,
        },
      });
    } else {
      await createMutation.mutateAsync({
        companyId,
        name: data.name,
        locationType: data.locationType,
        latitude: Number(data.latitude) || null,
        longitude: Number(data.longitude) || null,
        radiusMeters: Number(data.radiusMeters) || null,
        address: data.address || null,
        isActive: data.isActive,
      });
    }
    ui.hideAll();
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <form
      onSubmit={methods.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <FieldGroup className="flex flex-col gap-3">
        <InputField
          name="name"
          label="ชื่อสถานที่ลงเวลา"
          placeholder="เช่น สำนักงานใหญ่ (HQ - Bangkok)"
          control={methods.control}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <SelectField
            name="locationType"
            label="ประเภทการระบุพื้นที่"
            options={LOCATION_TYPE_OPTIONS}
            control={methods.control}
            required
          />

          <InputField
            name="radiusMeters"
            label="รัศมีอนุญาต (เมตร)"
            type="number"
            placeholder="100"
            control={methods.control}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InputField
            name="latitude"
            label="ละติจูด (Latitude)"
            type="number"
            placeholder="13.7563"
            control={methods.control}
          />
          <InputField
            name="longitude"
            label="ลองจิจูด (Longitude)"
            type="number"
            placeholder="100.5018"
            control={methods.control}
          />
        </div>

        <TextareaField
          name="address"
          label="ที่อยู่ / รายละเอียดสถานที่"
          placeholder="ระบุที่อยู่ของสถานที่นี้"
          control={methods.control}
        />

        <div className="flex flex-col gap-3 rounded-lg border p-3">
          <SwitchField
            name="isActive"
            label="เปิดใช้งานสถานที่นี้"
            description="พนักงานสามารถเช็คชื่อภายในพิกัดนี้ได้"
            control={methods.control}
          />
        </div>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLoading type="submit" isLoading={isLoading}>
          {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มสถานที่'}
        </ButtonLoading>
      </div>
    </form>
  );
}
