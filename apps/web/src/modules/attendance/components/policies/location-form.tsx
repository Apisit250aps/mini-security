'use client';

import {
  InputField,
  SelectField,
  TextareaField,
  SwitchField,
} from '@repo/ui/form';

import { CompanyBranchSelectField } from '@/modules/company/components/branches/company-branch-select-field';

import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAttendanceLocationSchema } from '@repo/domains/schema/attendance';
import type { z } from 'zod';
import {
  useAttendanceLocationCreate,
  useAttendanceLocationUpdate,
} from '../../hooks/attendance-mutations';
import { useOverlay } from '@repo/ui/hooks';

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
      latitude: location?.latitude ?? 13.7563,
      longitude: location?.longitude ?? 100.5018,
      radiusMeters: location?.radiusMeters ?? 100,
      address: location?.address || '',
      isActive: location?.isActive ?? true,
    },
  });

  const selectedLocationType = useWatch({
    control: methods.control,
    name: 'locationType',
  });

  const handleSubmit = async (data: FormValues) => {
    if (isEdit && location) {
      await updateMutation.mutateAsync({
        id: location.id,
        data: {
          branchId: data.locationType === 'BRANCH' ? data.branchId : null,
          name: data.name,
          locationType: data.locationType,
          latitude:
            data.latitude !== undefined && data.latitude !== null
              ? Number(data.latitude)
              : null,
          longitude:
            data.longitude !== undefined && data.longitude !== null
              ? Number(data.longitude)
              : null,
          radiusMeters:
            data.radiusMeters !== undefined && data.radiusMeters !== null
              ? Number(data.radiusMeters)
              : null,
          address: data.address || null,
          isActive: data.isActive,
        },
      });
    } else {
      await createMutation.mutateAsync({
        companyId,
        branchId: data.locationType === 'BRANCH' ? data.branchId : null,
        name: data.name,
        locationType: data.locationType,
        latitude:
          data.latitude !== undefined && data.latitude !== null
            ? Number(data.latitude)
            : null,
        longitude:
          data.longitude !== undefined && data.longitude !== null
            ? Number(data.longitude)
            : null,
        radiusMeters:
          data.radiusMeters !== undefined && data.radiusMeters !== null
            ? Number(data.radiusMeters)
            : null,
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

        <FieldGroup className="grid grid-cols-2 gap-3">
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
        </FieldGroup>

        {selectedLocationType === 'BRANCH' && (
          <CompanyBranchSelectField
            name="branchId"
            companyId={companyId}
            label="เลือกสาขาที่ผูก (Company Branch)"
            placeholder="เลือกสาขา..."
            control={methods.control}
          />
        )}

        <FieldGroup className="grid grid-cols-2 gap-3">
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
        </FieldGroup>

        <TextareaField
          name="address"
          label="ที่อยู่ / รายละเอียดสถานที่"
          placeholder="ระบุที่อยู่ของสถานที่นี้"
          control={methods.control}
        />

        <FieldGroup className="flex flex-col gap-3 rounded-lg border p-3">
          <SwitchField
            name="isActive"
            label="เปิดใช้งานสถานที่นี้"
            description="พนักงานสามารถเช็คชื่อภายในพิกัดนี้ได้"
            control={methods.control}
          />
        </FieldGroup>
      </FieldGroup>

      <div className="flex justify-end gap-2 pt-2">
        <ButtonLoading type="submit" isLoading={isLoading}>
          {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่มสถานที่'}
        </ButtonLoading>
      </div>
    </form>
  );
}
