'use client';

import React, { useSyncExternalStore } from 'react';

let timestamp: number | null = null;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | undefined;

function tick() {
  timestamp = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    tick();
    timer = setInterval(tick, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
      timestamp = null;
    }
  };
}

const getSnapshot = () => timestamp;
const getServerSnapshot = () => null;

export default function RealtimeClock() {
  const timestamp = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const time = timestamp === null ? null : new Date(timestamp);

  if (!time) {
    return (
      <div className="h-24 flex items-center justify-center">
        <span className="text-xs font-mono text-[#787774]">
          กำลังเชื่อมต่อเวลา...
        </span>
      </div>
    );
  }

  const hours = String(time.getHours()).padStart(2, '0');
  const minutes = String(time.getMinutes()).padStart(2, '0');
  const seconds = String(time.getSeconds()).padStart(2, '0');

  const formattedDate = time.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col items-center justify-center text-center gap-1.5">
      <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#EDF3EC] text-[#346538] border border-[rgba(52,101,56,0.15)] text-[11px] font-mono font-medium tracking-wide">
        <span className="size-1.5 rounded-full bg-[#346538] animate-pulse" />
        เวลาตามมาตรฐานประเทศไทย (ICT / UTC+7)
      </div>

      <div className="flex items-baseline justify-center gap-1 font-mono text-[#111111] tracking-tight select-none">
        <span className="text-4xl sm:text-5xl font-bold tracking-tighter">
          {hours}:{minutes}
        </span>
        <span className="text-xl sm:text-2xl font-light text-[#787774]">
          :{seconds}
        </span>
      </div>

      <p className="text-xs text-[#787774] font-medium tracking-normal">
        {formattedDate}
      </p>
    </div>
  );
}
