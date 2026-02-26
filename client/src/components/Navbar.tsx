import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Logo } from "./Logo";

const navItems = [
  { label: "Accessories", path: "/accessories" },
  { label: "Clearance", path: "/clearance" },
  { label: "Devices", path: "/devices" },
  { label: "Disposables", path: "/disposables" },
  { label: "Nicotine Pouches", path: "/nicotine-pouches" },
  { label: "Papers", path: "/papers" },
  { label: "Vape Juice", path: "/vape-juice" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
] as const;

function NavLinks({
  className,
  onClick,
  activePath,
}: {
  className?: string;
  onClick?: () => void;
  activePath: string | null;
}) {
  return (
    <ul className={className}>
      {navItems.map(({ label, path }) => {
        const isActiveExact = activePath === path;
        return (
          <li key={path}>
            <Link
              to={path}
              onClick={onClick}
              className={`group relative block rounded-md border-0 px-3 py-2 text-base font-medium ring-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 md:inline-block ${
                isActiveExact ? "text-cyan-400" : "text-slate-300"
              } hover:text-white group-hover:ring-2 group-hover:ring-cyan-400/50 group-hover:ring-inset`}
            >
              <span className="absolute inset-0 rounded-md bg-gradient-to-r from-cyan-500 to-cyan-600 opacity-0 shadow-md shadow-cyan-500/25 transition-opacity group-hover:opacity-100" aria-hidden />
              <span className="relative">{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const showActive =
    pathname !== "/products" &&
    !pathname.startsWith("/products") &&
    pathname !== "/best-sellers" &&
    !pathname.startsWith("/best-sellers");
  const activePath = showActive ? pathname : null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo iconClassName="h-8 w-8 sm:h-9 sm:w-9" />

        {/* Desktop / tablet horizontal nav — visible from lg up */}
        <div className="hidden flex-wrap items-center justify-center gap-1 sm:gap-2 lg:flex">
          <NavLinks className="flex items-center gap-1" activePath={activePath} />
        </div>

        {/* Mobile / tablet: hamburger + dropdown */}
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile / tablet menu panel */}
      {menuOpen && (
        <div className="border-t border-slate-700/50 bg-slate-900 lg:hidden">
          <NavLinks
            className="flex flex-col gap-0.5 p-4 pb-5"
            onClick={() => setMenuOpen(false)}
            activePath={activePath}
          />
        </div>
      )}
    </nav>
  );
}
