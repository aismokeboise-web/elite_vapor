import { useEffect } from "react";

interface AdminModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Use "wide" for create/edit product and model modals on laptop+ */
  size?: "default" | "wide";
}

export function AdminModal({ title, open, onClose, children, size = "default" }: AdminModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
        aria-hidden
        onClick={onClose}
      />
      <div className={`relative w-full rounded-2xl border border-slate-300 bg-white font-admin shadow-2xl ${size === "wide" ? "max-w-md md:max-w-2xl lg:max-w-3xl" : "max-w-md"}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-white rounded-t-2xl">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-5 py-4 bg-white text-slate-900 rounded-b-2xl">{children}</div>
      </div>
    </div>
  );
}
