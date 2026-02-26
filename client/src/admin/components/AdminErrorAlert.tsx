interface AdminErrorAlertProps {
  message: string;
  title?: string;
}

export function AdminErrorAlert({ message, title = "Something went wrong" }: AdminErrorAlertProps) {
  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50/95 px-5 py-4 shadow-sm"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600"
          aria-hidden
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold tracking-tight text-amber-900">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-amber-800">{message}</p>
        </div>
      </div>
    </div>
  );
}
