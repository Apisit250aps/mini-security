'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLocationSchema } from '@repo/domains/schema/location';
import type { Location, CreateLocation } from '@repo/client';
import { InputField, SwitchField } from '@repo/ui/form';
import { FieldGroup } from '@repo/ui/components/field';
import { Button } from '@repo/ui/components/button';
import { ButtonLoading } from '@repo/ui/components/shared/button/index';
import { useOrganizationSitesQueries } from '@/modules/organization/hooks/organization-queries';
import { SiteSelectField } from '@/shared/components/form';
import { useLocationSave } from '../hooks/location-mutations';

export default function LocationForm({
  organizationId,
  location,
  onClose,
}: {
  organizationId?: string;
  location?: Location;
  onClose: () => void;
}) {
  const activeOrgId = organizationId || '';
  const sites = useOrganizationSitesQueries(activeOrgId);
  const mutation = useLocationSave(activeOrgId);
  const form = useForm<CreateLocation>({
    resolver: zodResolver(createLocationSchema),
    defaultValues: location
      ? {
          organizationId: activeOrgId,
          siteId: location.siteId,
          name: location.name,
          address: location.address ?? '',
          latitude: location.latitude,
          longitude: location.longitude,
          radiusMeters: location.radiusMeters,
          isActive: location.isActive,
          isPrimary: location.isPrimary,
        }
      : {
          organizationId: activeOrgId,
          siteId: '',
          name: '',
          address: '',
          isActive: true,
          isPrimary: false,
          radiusMeters: 100,
          latitude: 13.7563,
          longitude: 100.5018,
        },
  });

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((data) => {
        if (mutation.isPending) return;
        if (location) {
          const {
            organizationId: _organizationId,
            siteId: _siteId,
            ...update
          } = data;
          mutation.mutate(
            { id: location.id, data: update },
            { onSuccess: onClose },
          );
        } else {
          mutation.mutate(
            { data: { ...data, organizationId: activeOrgId } },
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
            ไซต์/สาขา:{' '}
            {sites.data?.find((site) => site.id === location.siteId)?.name ??
              (location.siteId ? 'ไซต์หลัก' : '-')}
          </p>
        ) : (
          <SiteSelectField
            organizationId={activeOrgId}
            control={form.control}
            name="siteId"
            label="ไซต์ / สาขา"
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
          label="สถานที่หลักของไซต์"
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
          isDisabled={sites.isError || sites.isLoading}
        >
          บันทึกสถานที่
        </ButtonLoading>
      </div>
    </form>
  );
}
