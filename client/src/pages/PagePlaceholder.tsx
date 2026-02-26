type PagePlaceholderProps = {
  title: string;
};

export function PagePlaceholder({ title }: PagePlaceholderProps) {
  return (
    <div className="flex min-h-[calc(100vh-2rem-3.5rem)] items-center justify-center px-4">
      <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
    </div>
  );
}
