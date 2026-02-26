import { Link } from "react-router-dom";

const iconClass = "h-6 w-6";

const CategoryIcon = ({ name }: { name: string }) => {
  const props = { className: iconClass, fill: "none" as const, viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 1.5, "aria-hidden": true };
  switch (name) {
    case "Devices":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
      );
    case "Vape Juice":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM19.5 8.25v12.75a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V8.25m15 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v2.25m15 0v2.25a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 10.5V8.25" />
        </svg>
      );
    case "Disposables":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      );
    case "Deals":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
      );
    case "Accessories":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.227-.268.264-.623.095-.884l-6.602-8.063a.75.75 0 00-1.06-.063L2.5 5.877m8.92 9.293l-3.03 2.496c-.268.227-.623.264-.884.095L2.5 5.877" />
        </svg>
      );
    case "Nicotine Pouches":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      );
    case "Papers":
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
        </svg>
      );
  }
};

const categories = [
  { label: "Devices", path: "/devices", description: "Pods, mods & kits" },
  { label: "Vape Juice", path: "/vape-juice", description: "E-liquids & flavors" },
  { label: "Disposables", path: "/disposables", description: "Ready to use" },
  { label: "Deals", path: "/deals", description: "Limited-time offers" },
  { label: "Accessories", path: "/accessories", description: "Coils & more" },
  { label: "Nicotine Pouches", path: "/nicotine-pouches", description: "Tobacco-free" },
  { label: "Papers", path: "/papers", description: "Rolling papers" },
] as const;

export function ShopByCategory() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" aria-labelledby="view-by-category-heading">
      <div className="mb-10 text-center">
        <h2 id="view-by-category-heading" className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          View by category
        </h2>
        <p className="mt-2 text-sm font-medium italic text-cyan-700/90 sm:text-base">
          Browse our range by category
        </p>
        <div className="mx-auto mt-3 flex justify-center gap-1" aria-hidden>
          <span className="h-1 w-8 rounded-full bg-cyan-500" />
          <span className="h-1 w-3 rounded-full bg-cyan-400/70" />
          <span className="h-1 w-2 rounded-full bg-cyan-400/50" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {categories.map(({ label, path, description }) => (
          <Link
            key={path}
            to={path}
            className="group flex flex-col items-center rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all hover:border-cyan-200 hover:shadow-md hover:shadow-cyan-500/10"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors group-hover:bg-cyan-100 group-hover:text-cyan-600">
              <CategoryIcon name={label} />
            </span>
            <span className="mt-3 font-semibold text-slate-900 group-hover:text-cyan-700">{label}</span>
            <span className="mt-1 text-xs text-slate-500">{description}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
