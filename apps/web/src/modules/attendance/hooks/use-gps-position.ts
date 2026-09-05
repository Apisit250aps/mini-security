'use client';

import { useQuery } from '@tanstack/react-query';
import type { AttendanceLocation } from '@repo/domains/entities';

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) *
      Math.cos(phi2) *
      Math.sin(deltaLambda / 2) *
      Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export type GPSState = {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  nearestLocation: AttendanceLocation | null;
  distanceMeters: number | null;
  isWithinRadius: boolean;
  isLoading: boolean;
  error: string | null;
};

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('เบราว์เซอร์ไม่รองรับ Geolocation'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? 'กรุณาอนุญาตการเข้าถึงตำแหน่งที่ตั้งในเบราว์เซอร์'
            : error.code === error.POSITION_UNAVAILABLE
              ? 'ไม่พบสัญญาณตำแหน่งที่ตั้ง'
              : error.code === error.TIMEOUT
                ? 'หมดเวลาเชื่อมต่อ GPS'
                : 'ไม่สามารถดึงตำแหน่ง GPS ได้';
        reject(new Error(message));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 },
    );
  });
}

export function useGPSPosition(
  companyId: string,
  locations: AttendanceLocation[],
  enabled: boolean,
) {
  const query = useQuery({
    queryKey: ['ATTENDANCE', 'GPS', companyId],
    queryFn: getPosition,
    enabled,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    gcTime: 0,
  });
  const position = query.isError ? undefined : query.data;
  const latitude = position?.coords.latitude ?? null;
  const longitude = position?.coords.longitude ?? null;
  let nearestLocation: AttendanceLocation | null = null;
  let distanceMeters: number | null = null;
  let isWithinRadius = false;
  if (latitude !== null && longitude !== null) {
    const activeLocations = locations.filter(
      (location) => location.latitude != null && location.longitude != null,
    );
    isWithinRadius = activeLocations.length === 0;
    for (const location of activeLocations) {
      const distance = calculateDistance(
        latitude,
        longitude,
        Number(location.latitude),
        Number(location.longitude),
      );
      if (distanceMeters === null || distance < distanceMeters) {
        distanceMeters = distance;
        nearestLocation = location;
        isWithinRadius = distance <= (location.radiusMeters || 100);
      }
    }
  }
  const state: GPSState = {
    latitude,
    longitude,
    accuracy: position ? Math.round(position.coords.accuracy) : null,
    nearestLocation,
    distanceMeters,
    isWithinRadius,
    isLoading: query.isPending || query.isFetching,
    error: query.error?.message ?? null,
  };
  return {
    state,
    refresh: () => {
      void query.refetch();
    },
  };
}
