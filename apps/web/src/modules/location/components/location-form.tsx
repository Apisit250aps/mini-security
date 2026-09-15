'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLocationSchema } from '@repo/domains/schema/location';
import type { Location } from '@repo/client';
import type { CreateLocation } from '@repo/domains/schema/location';
import { InputField, SelectField, SwitchField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useCompanyBranchesQueries } from '@/modules/company/hooks/company-queries';
import { CompanyBranchSelectField } from '@/shared/components/form';
import { useLocationSave } from '../hooks/location-mutations';

export default function LocationForm({
  companyId,
  location,
  onClose,
}: {
  companyId: string;
  location?: Location;
  onClose: () => void;
}) {
  const branches = useCompanyBranchesQueries(companyId);
  const mutation = useLocationSave(companyId);
  const form = useForm<CreateLocation>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: location
      ? {
          companyId,
          companyBranchId: location.companyBranchId,
          name: location.name,
          address: location.address ?? '',
          latitude: location.latitude,
          longitude: location.longitude,
          radiusMeters: location.radiusMeters,
          isActive: location.isActive,
          isPrimary: location.isPrimary,
        }
      : {
          companyId,
          companyBranchId: '',
          name: '',
          address: '',
          isActive: true,
          isPrimary: false,
          radiusMeters: 100,
        },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((data) => {
        if (mutation.isPending) return;
        if (location) {
          const {
            companyId: _companyId,
            companyBranchId: _branchId,
            ...update
          } = data;
          mutation.mutate(
            { id: location.id, data: update },
            { onSuccess: onClose },
          );
        } else {
          mutation.mutate(
            { data: { ...data, companyId } },
            { onSuccess: onClose },
          );
        }
      })}
    >
      <h3>{location ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่'}</h3>
      <p className="text-sm text-muted-foreground">
        ข้อมูลสถานที่นี้ใช้ร่วมกันทุก Slot ที่เลือกสถานที่นี้
      </p>
      <FieldGroup>
        {location ? (
          <p>
            สาขา:{' '}
            {branches.data?.find(
              (branch) => branch.id === location.companyBranchId,
            )?.name ?? location.companyBranchId}
          </p>
        ) : (
          <CompanyBranchSelectField
            companyId={companyId}
            control={form.control}
            name="companyBranchId"
            label="สาขา"
            required
          />
        )}
        <InputField
          control={form.control}
          name="name"
          label="ชื่อสถานที่"
          required
        />
        <InputField
          control={form.control}
          name="address"
          label="ที่อยู่"
          required
        />
        <InputField
          control={form.control}
          name="latitude"
          label="ละติจูด"
          type="number"
          step="any"
          min={-90}
          max={90}
          required
        />
        <InputField
          control={form.control}
          name="longitude"
          label="ลองจิจูด"
          type="number"
          step="any"
          min={-180}
          max={180}
          required
        />
        <InputField
          control={form.control}
          name="radiusMeters"
          label="รัศมีที่อนุญาต (เมตร)"
          type="number"
          step="any"
          min={0.01}
          required
        />
        <SwitchField
          control={form.control}
          name="isActive"
          label="เปิดใช้งานสถานที่"
        />
        <SwitchField
          control={form.control}
          name="isPrimary"
          label="สถานที่หลักของสาขา"
        />
      </FieldGroup>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onPress={onClose}
          isDisabled={mutation.isPending}
        >
          ยกเลิก
        </Button>
        <ButtonLoading
          type="submit"
          isLoading={mutation.isPending}
          isDisabled={branches.isError || branches.isLoading}
        >
          บันทึกสถานที่
        </ButtonLoading>
      </div>
    </form>
  );
}
