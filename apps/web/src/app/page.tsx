'use client';
import React from 'react';
import Link from 'next/link';
import { buildPageUrl } from '@/shared/utils';

export default function Page() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#FBFBFA]">
      {/* Ambient background blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,0,0,0.025) 0%, transparent 70%)',
        }}
      />

      {/* Status badge */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl mx-auto gap-8">
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '9999px',
            background: '#EDF3EC',
            color: '#346538',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            border: '1px solid rgba(52,101,56,0.15)',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#346538',
              display: 'inline-block',
            }}
          />
          ระบบพร้อมใช้งาน
        </div>

        {/* Hero heading */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h1
            style={{
              fontFamily: "'Newsreader', 'Playfair Display', 'Georgia', serif",
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: '#111111',
              margin: 0,
            }}
          >
            Mini Security
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-kanit), "Helvetica Neue", sans-serif',
              fontSize: '1.1rem',
              color: '#787774',
              lineHeight: 1.7,
              margin: 0,
              maxWidth: '480px',
            }}
          >
            ระบบจัดการสิทธิ์และความปลอดภัยด้วย Clean Architecture, PBAC และ
            Better Auth
          </p>
        </div>

        {/* Divider */}
        <div
          style={{
            width: '48px',
            height: '1px',
            background: '#EAEAEA',
          }}
        />

        {/* Feature bento grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            width: '100%',
            maxWidth: '480px',
          }}
        >
          {[
            {
              label: 'PBAC',
              desc: 'สิทธิ์ตามนโยบาย',
              color: '#E1F3FE',
              text: '#1F6C9F',
            },
            {
              label: 'Auth',
              desc: 'Better Auth',
              color: '#FBF3DB',
              text: '#956400',
            },
            {
              label: 'Clean',
              desc: 'Architecture',
              color: '#EDF3EC',
              text: '#346538',
            },
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                border: '1px solid #EAEAEA',
                borderRadius: '12px',
                padding: '20px 16px',
                background: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                animationDelay: `${i * 80}ms`,
              }}
              className="fade-in-up"
            >
              <span
                style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: item.color,
                  color: item.text,
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  alignSelf: 'flex-start',
                }}
              >
                {item.label}
              </span>
              <p
                style={{
                  fontSize: '0.8rem',
                  color: '#787774',
                  margin: 0,
                  fontFamily: 'var(--font-kanit), sans-serif',
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Link
            href={buildPageUrl('signIn')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              background: '#111111',
              color: '#FFFFFF',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 500,
              fontFamily: 'var(--font-kanit), sans-serif',
              textDecoration: 'none',
              transition: 'background 200ms, transform 100ms',
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
          <Link
            href={buildPageUrl('companyDashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              background: 'transparent',
              color: '#111111',
              borderRadius: '6px',
              border: '1px solid #EAEAEA',
              fontSize: '0.875rem',
              fontWeight: 500,
              fontFamily: 'var(--font-kanit), sans-serif',
              textDecoration: 'none',
              transition: 'border-color 200ms, box-shadow 200ms',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow =
                '0 2px 8px rgba(0,0,0,0.04)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            แดชบอร์ดบริษัท
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          position: 'absolute',
          bottom: '32px',
          left: 0,
          right: 0,
          textAlign: 'center',
          color: '#BBBAB8',
          fontSize: '12px',
          fontFamily: 'var(--font-kanit), sans-serif',
          letterSpacing: '0.03em',
        }}
      >
        Mini Security · Clean Architecture · {new Date().getFullYear()}
      </footer>

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
