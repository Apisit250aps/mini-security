'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#FBFBFA]">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,0,0,0.02) 0%, transparent 70%)',
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
            WebkitTextStroke: '1.5px #EAEAEA',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          404
        </div>

        {/* Content block */}
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
              background: '#EAEAEA',
              color: '#787774',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            ไม่พบหน้า
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
            ไม่พบหน้าที่คุณต้องการ
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
            ขออภัย ไม่พบหน้าที่คุณกำลังค้นหา หน้าดังกล่าวอาจถูกย้าย ลบ
            หรือที่อยู่ URL ไม่ถูกต้อง
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
            <button
              onClick={() => router.back()}
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
                cursor: 'pointer',
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
                  d="M11 7H3M6 10L3 7l3-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              ย้อนกลับ
            </button>
            <Link
              href="/"
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
