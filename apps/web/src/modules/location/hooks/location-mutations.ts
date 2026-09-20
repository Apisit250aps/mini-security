import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  locationServiceCreateLocation,
  locationServiceUpdateLocation,
  locationServiceAssignSlotLocation,
  locationServiceUpdateSlotLocation,
  type CreateLocation,
  type UpdateLocation,
  type ScheduleSlotLocation,
} from '@repo/client';
import { toast } from '@repo/ui/components/sonner';
import { getErrorMessage } from '@/shared/utils';
import { locationKeys } from './location-queries';

export function useLocationSave(companyId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      input:
        | { id: string; data: UpdateLocation }
        | { id?: undefined; data: CreateLocation },
    ) => {
      if (input.id !== undefined) {
        return (
          await locationServiceUpdateLocation({
            path: { id: input.id },
            body: input.data,
            throwOnError: true,
          })
        ).data.data;
      }
      return (
        await locationServiceCreateLocation({
          body: input.data,
          throwOnError: true,
        })
      ).data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: locationKeys.company(companyId),
      });
      toast.success('บันทึกสถานที่สำเร็จ');
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'บันทึกสถานที่ไม่สำเร็จ')),
  });
}

export function useSlotLocationToggle(companyId: string, slotId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      locationId,
      assignment,
    }: {
      locationId: string;
      assignment?: ScheduleSlotLocation;
    }) => {
      if (assignment) {
        return locationServiceUpdateSlotLocation({
          path: { id: assignment.id },
          body: { isActive: !assignment.isActive },
          throwOnError: true,
        });
      }
      return locationServiceAssignSlotLocation({
        body: { companyId, scheduleSlotId: slotId, locationId, isActive: true },
        throwOnError: true,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: locationKeys.company(companyId),
      });
      toast.success('บันทึกตำแหน่งของรอบเวลาสำเร็จ');
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, 'บันทึกตำแหน่งของรอบเวลาไม่สำเร็จ')),
  });
}
