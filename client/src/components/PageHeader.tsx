type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      {/* Subtle background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgb(34_211_238_/_0.08),transparent)]" aria-hidden />
      <div className="relative mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mx-auto mt-2 max-w-2xl text-base text-slate-600 sm:text-lg">
            {subtitle}
          </p>
        )}
        <div className="mx-auto mt-4 flex justify-center gap-1" aria-hidden>
          <span className="h-1 w-8 rounded-full bg-cyan-500" />
          <span className="h-1 w-3 rounded-full bg-cyan-400/70" />
          <span className="h-1 w-2 rounded-full bg-cyan-400/50" />
        </div>
      </div>
    </header>
  );
}
