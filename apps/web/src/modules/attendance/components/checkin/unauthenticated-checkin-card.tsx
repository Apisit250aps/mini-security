'use client';

import React from 'react';
import Link from 'next/link';
import { buildPageUrl } from '@/shared/utils';

export default function UnauthenticatedCheckinCard() {
  return (
    <div className="flex flex-col items-center text-center p-8 sm:p-12 rounded-xl border border-[#EAEAEA] bg-[#FFFFFF] max-w-lg mx-auto gap-6">
      <div className="size-12 rounded-full bg-[#F7F6F3] border border-[#EAEAEA] flex items-center justify-center text-[#111111] font-mono text-sm font-bold">
        ID
      </div>

      <div className="space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold text-[#111111] tracking-tight">
          ลงชื่อเข้าใช้งานเพื่อลงเวลาทำงาน
        </h2>
        <p className="text-xs sm:text-sm text-[#787774] leading-relaxed max-w-sm mx-auto">
          ระบบตรวจสอบพิกัด GPS และนโยบายกะการทำงานอัตโนมัติตาม Role
          ของพนักงานในสังกัดบริษัท
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
        <Link
          href={buildPageUrl('signIn')}
          className="w-full sm:flex-1 py-3 px-5 rounded-lg bg-[#111111] text-[#FFFFFF] text-xs font-semibold tracking-wide text-center transition-all hover:bg-[#2F3437] active:scale-[0.98]"
        >
          เข้าสู่ระบบ (Sign In)
        </Link>
        <Link
          href={buildPageUrl('signUp')}
          className="w-full sm:flex-1 py-3 px-5 rounded-lg bg-transparent border border-[#EAEAEA] text-[#111111] text-xs font-semibold tracking-wide text-center transition-all hover:bg-[#F9F9F8] active:scale-[0.98]"
        >
          ลงทะเบียนบัญชีใหม่
        </Link>
      </div>

      <div className="flex items-center gap-4 pt-4 border-t border-[#EAEAEA] w-full justify-center text-[11px] font-mono text-[#BBBAB8]">
        <span>Clean Architecture</span>
        <span>·</span>
        <span>GPS Geofencing</span>
        <span>·</span>
        <span>PBAC Protected</span>
      </div>
    </div>
  );
}
