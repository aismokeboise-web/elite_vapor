'use client';

interface LogoProps {
  className?: string;
}

/** Elite Vapor – wispy vape smoke logo (indigo primary) */
export function Logo({ className = 'h-8 w-8' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="elite-vapor-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="elite-smoke-left" x1="16" y1="26" x2="2" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="0.45" stopColor="white" stopOpacity="0.9" />
          <stop offset="1" stopColor="white" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="elite-smoke-mid" x1="16" y1="26" x2="16" y2="2" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="0.4" stopColor="white" stopOpacity="0.95" />
          <stop offset="1" stopColor="white" stopOpacity="0.25" />
        </linearGradient>
        <linearGradient id="elite-smoke-right" x1="16" y1="26" x2="30" y2="6" gradientUnits="userSpaceOnUse">
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="0.45" stopColor="white" stopOpacity="0.9" />
          <stop offset="1" stopColor="white" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#elite-vapor-bg)" />
      <path
        d="M16 24 C 10 24 4 18 4 10"
        stroke="url(#elite-smoke-left)"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M16 26 C 16 14 16 4 15 4"
        stroke="url(#elite-smoke-mid)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M16 24 C 22 24 28 18 28 10"
        stroke="url(#elite-smoke-right)"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
