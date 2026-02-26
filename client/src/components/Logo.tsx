import { useId } from "react";
import { Link, useLocation } from "react-router-dom";

type LogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
};

const defaultTextClass = "text-lg font-semibold tracking-tight text-white transition-colors hover:text-cyan-400";

export function Logo({
  className = "",
  iconClassName = "h-8 w-8",
  textClassName = defaultTextClass,
  showText = true,
}: LogoProps) {
  const gradientId = useId();
  const { pathname } = useLocation();
  const hasNoNavLink =
    pathname === "/products" ||
    pathname.startsWith("/products/") ||
    pathname === "/best-sellers" ||
    pathname.startsWith("/best-sellers/");
  const isLogoActive = pathname === "/" || hasNoNavLink;
  const activeTextClass = "text-lg font-semibold tracking-tight text-cyan-400 transition-colors hover:text-cyan-300";
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`}>
      <span className="flex-shrink-0" aria-hidden>
        <svg
          className={iconClassName}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Empire Vapor logo"
        >
          <rect
            width="40"
            height="40"
            rx="8"
            fill={`url(#${gradientId})`}
          />
          <path
            d="M20 10c-2 4-6 8-6 12 0 3.3 2.7 6 6 6s6-2.7 6-6c0-4-4-8-6-12z"
            fill="white"
            fillOpacity="0.95"
          />
          <defs>
            <linearGradient
              id={gradientId}
              x1="0"
              y1="0"
              x2="40"
              y2="40"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#06b6d4" />
              <stop offset="1" stopColor="#0891b2" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      {showText && (
        <span className={isLogoActive ? activeTextClass : textClassName}>Empire Vapor</span>
      )}
    </Link>
  );
}
