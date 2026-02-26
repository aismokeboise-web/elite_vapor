import { Link } from "react-router-dom";
import { Logo } from "./Logo";

const shopLinks = [
  { label: "Accessories", path: "/accessories" },
  { label: "Clearance", path: "/clearance" },
  { label: "Deals", path: "/deals" },
  { label: "Devices", path: "/devices" },
  { label: "Disposables", path: "/disposables" },
  { label: "Pouches", path: "/nicotine-pouches" },
  { label: "Papers", path: "/papers" },
  { label: "Vape Juice", path: "/vape-juice" },
  { label: "Products", path: "/products" },
] as const;

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.067-.06-1.407-.06-4.123v-.08c0-2.643.012-2.987.06-4.043.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.994 2.013 9.338 2 11.962 2h.353zm0 5.838a3.808 3.808 0 100 7.616 3.808 3.808 0 000-7.616zM12.002 15a2.999 2.999 0 110-5.998 2.999 2.999 0 010 5.998z" clipRule="evenodd" />
        <path d="M18.406 5.094a1.12 1.12 0 100 2.24 1.12 1.12 0 000-2.24z" />
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "https://tiktok.com",
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
  },
] as const;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo
              iconClassName="h-9 w-9"
              textClassName="text-lg font-semibold text-white transition-colors hover:text-cyan-400"
            />
            <p className="mt-3 text-sm text-slate-400">
              Your trusted source for devices, e-liquids, and accessories.
            </p>
          </div>

          {/* Shop links — multi-column to reduce height */}
          <div className="border-t border-slate-700/80 pt-6 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Shop
            </h3>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
              {shopLinks.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-sm transition-colors hover:text-cyan-400"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="border-t border-slate-700/80 pt-6 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Company
            </h3>
            <ul className="mt-3 space-y-1.5">
              <li>
                <Link
                  to="/about"
                  className="text-sm transition-colors hover:text-cyan-400"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm transition-colors hover:text-cyan-400"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow us */}
          <div className="border-t border-slate-700/80 pt-6 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Follow us
            </h3>
            <ul className="mt-3 flex flex-wrap gap-3">
              {socialLinks.map(({ label, href, icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-slate-400 transition-colors hover:bg-cyan-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    aria-label={label}
                  >
                    {icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="mt-8 border-t border-slate-800 pt-6">
          <p className="text-center text-xs text-slate-500">
            Warning: Smoking is injurious to health. Products contain nicotine. Nicotine is an addictive chemical.
          </p>
          <p className="mt-4 text-center text-sm text-slate-500">
            © {currentYear} Empire Vapor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
