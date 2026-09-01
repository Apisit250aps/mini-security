'use client';

import React from 'react';
import Link from 'next/link';
import { buildPageUrl } from '@/shared/utils';

export default function Unauthorized() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#FBFBFA]">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(149,100,0,0.025) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl mx-auto gap-8">
        {/* Large typographic status code */}
        <div
          aria-hidden="true"
          style={{
            fontFamily: "'Newsreader', 'Playfair Display', 'Georgia', serif",
            fontSize: 'clamp(6rem, 20vw, 12rem)',
            fontWeight: 700,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: 'transparent',
            WebkitTextStroke: '1.5px #F3E9C8',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          401
        </div>

        {/* Content card */}
        <div
          style={{
            border: '1px solid #EAEAEA',
            borderRadius: '12px',
            padding: '40px',
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            width: '100%',
            maxWidth: '420px',
            marginTop: '-48px',
          }}
          className="fade-in-up"
        >
          {/* Status badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              background: '#FBF3DB',
              color: '#956400',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {/* Lock icon */}
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="1.5"
                y="4"
                width="7"
                height="5.5"
                rx="1"
                stroke="#956400"
                strokeWidth="1.2"
              />
              <path
                d="M3 4V3a2 2 0 0 1 4 0v1"
                stroke="#956400"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            ต้องเข้าสู่ระบบก่อน
          </span>

          <h1
            style={{
              fontFamily: "'Newsreader', 'Playfair Display', 'Georgia', serif",
              fontSize: '1.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              color: '#111111',
              margin: 0,
            }}
          >
            กรุณาเข้าสู่ระบบ
          </h1>

          <p
            style={{
              fontSize: '0.875rem',
              color: '#787774',
              lineHeight: 1.65,
              margin: 0,
              fontFamily: 'var(--font-kanit), sans-serif',
            }}
          >
            คุณจำเป็นต้องเข้าสู่ระบบก่อน เพื่อเข้าใช้งานหน้าดังกล่าว
            กรุณาเข้าสู่ระบบด้วยบัญชีของคุณ
          </p>

          <div
            style={{
              width: '100%',
              height: '1px',
              background: '#EAEAEA',
              margin: '4px 0',
            }}
          />

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
            <Link
              href="/"
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '9px 16px',
                background: 'transparent',
                color: '#111111',
                borderRadius: '6px',
                border: '1px solid #EAEAEA',
                fontSize: '0.875rem',
                fontWeight: 500,
                fontFamily: 'var(--font-kanit), sans-serif',
                textDecoration: 'none',
                transition: 'box-shadow 200ms',
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow =
                  '0 2px 8px rgba(0,0,0,0.04)';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 7.5L7 3l5 4.5M3.5 6.5V11h2.75V8.5h1.5V11H10.5V6.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              หน้าหลัก
            </Link>
            <Link
              href={buildPageUrl('signIn')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '9px 16px',
                background: '#111111',
                color: '#FFFFFF',
                borderRadius: '6px',
                border: '1px solid transparent',
                fontSize: '0.875rem',
                fontWeight: 500,
                fontFamily: 'var(--font-kanit), sans-serif',
                textDecoration: 'none',
                transition: 'background 200ms',
              }}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#333333';
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLElement).style.background = '#111111';
              }}
            >
              เข้าสู่ระบบ
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 7h8M8 4l3 3-3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          animation: fadeInUp 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </main>
  );
}
