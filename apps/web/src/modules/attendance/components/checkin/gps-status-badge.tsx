'use client';

import React, { useCallback, useEffect, useState } from 'react';
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

export default function GPSStatusBadge({
  locations = [],
  onGPSUpdate,
}: {
  locations?: AttendanceLocation[];
  onGPSUpdate?: (state: GPSState) => void;
}) {
  const [state, setState] = useState<GPSState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    nearestLocation: null,
    distanceMeters: null,
    isWithinRadius: false,
    isLoading: true,
    error: null,
  });

  const requestPosition = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      const nextState: GPSState = {
        latitude: null,
        longitude: null,
        accuracy: null,
        nearestLocation: null,
        distanceMeters: null,
        isWithinRadius: false,
        isLoading: false,
        error: 'เบราว์เซอร์ไม่รองรับ Geolocation',
      };
      setState(nextState);
      onGPSUpdate?.(nextState);
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const acc = Math.round(pos.coords.accuracy);

        let nearest: AttendanceLocation | null = null;
        let minDistance: number | null = null;
        let within = false;

        const activeLocations = locations.filter(
          (loc) => loc.latitude != null && loc.longitude != null,
        );

        if (activeLocations.length > 0) {
          for (const loc of activeLocations) {
            const d = calculateDistance(
              lat,
              lon,
              Number(loc.latitude),
              Number(loc.longitude),
            );
            if (minDistance === null || d < minDistance) {
              minDistance = d;
              nearest = loc;
              const radius = loc.radiusMeters || 100;
              within = d <= radius;
            }
          }
        } else {
          within = true; // No location restriction configured
        }

        const nextState: GPSState = {
          latitude: lat,
          longitude: lon,
          accuracy: acc,
          nearestLocation: nearest,
          distanceMeters: minDistance,
          isWithinRadius: within,
          isLoading: false,
          error: null,
        };
        setState(nextState);
        onGPSUpdate?.(nextState);
      },
      (err) => {
        let msg = 'ไม่สามารถดึงตำแหน่ง GPS ได้';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'กรุณาอนุญาตการเข้าถึงตำแหน่งที่ตั้งในเบราว์เซอร์';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'ไม่พบสัญญาณตำแหน่งที่ตั้ง';
        } else if (err.code === err.TIMEOUT) {
          msg = 'หมดเวลาเชื่อมต่อ GPS';
        }
        const nextState: GPSState = {
          latitude: null,
          longitude: null,
          accuracy: null,
          nearestLocation: null,
          distanceMeters: null,
          isWithinRadius: false,
          isLoading: false,
          error: msg,
        };
        setState(nextState);
        onGPSUpdate?.(nextState);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 15000,
      },
    );
  }, [locations, onGPSUpdate]);

  useEffect(() => {
    requestPosition();
  }, [requestPosition]);

  if (state.isLoading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[#EAEAEA] bg-[#F9F9F8] text-[11px] font-mono text-[#787774]">
        <span className="size-2 rounded-full bg-[#BBBAB8] animate-ping" />
        กำลังค้นหาพิกัด GPS...
      </div>
    );
  }

  if (state.error) {
    return (
      <button
        type="button"
        onClick={requestPosition}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[rgba(159,47,45,0.2)] bg-[#FDEBEC] text-[#9F2F2D] text-[11px] font-mono transition-opacity hover:opacity-80"
        title="คลิกเพื่อลองใหม่"
      >
        <span className="size-2 rounded-full bg-[#9F2F2D]" />
        {state.error} (แตะเพื่อรีเฟรช)
      </button>
    );
  }

  if (state.isWithinRadius) {
    return (
      <button
        type="button"
        onClick={requestPosition}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[rgba(52,101,56,0.2)] bg-[#EDF3EC] text-[#346538] text-[11px] font-mono transition-opacity hover:opacity-80 text-left"
      >
        <span className="size-2 rounded-full bg-[#346538]" />
        <span>
          อยู่ในพื้นที่:{' '}
          <strong>{state.nearestLocation?.name || 'พิกัดที่กำหนด'}</strong>{' '}
          {state.distanceMeters !== null && `(${state.distanceMeters} ม.)`}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={requestPosition}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-[rgba(149,100,0,0.2)] bg-[#FBF3DB] text-[#956400] text-[11px] font-mono transition-opacity hover:opacity-80 text-left"
    >
      <span className="size-2 rounded-full bg-[#956400]" />
      <span>
        อยู่นอกพื้นที่เช็คชื่อ ({state.distanceMeters} ม. จาก{' '}
        {state.nearestLocation?.name || 'สาขา'})
      </span>
    </button>
  );
}
