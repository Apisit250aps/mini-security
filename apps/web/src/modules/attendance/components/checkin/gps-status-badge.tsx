'use client';

import type { GPSState } from '../../hooks/use-gps-position';
export type { GPSState } from '../../hooks/use-gps-position';

export default function GPSStatusBadge({
  state,
  onRefresh,
}: {
  state: GPSState;
  onRefresh: () => void;
}) {
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
        onClick={onRefresh}
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
        onClick={onRefresh}
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
      onClick={onRefresh}
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
