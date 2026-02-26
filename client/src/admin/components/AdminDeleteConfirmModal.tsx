import { useEffect } from "react";

interface AdminDeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  itemLabel: string;
  onConfirm: () => void | Promise<void>;
  confirming?: boolean;
  /** Default: "Delete" / "Deleting…" */
  confirmLabel?: string;
  confirmingLabel?: string;
  /** Verb used in the message, e.g. "delete" or "unsubscribe". Default: "delete" */
  actionVerb?: string;
}

export function AdminDeleteConfirmModal({
  open,
  onClose,
  title,
  itemLabel,
  onConfirm,
  confirming = false,
  confirmLabel = "Delete",
  confirmingLabel = "Deleting…",
  actionVerb = "delete",
}: AdminDeleteConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !confirming) onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose, confirming]);

  if (!open) return null;

  const handleConfirm = () => {
    void Promise.resolve(onConfirm()).catch(() => {});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        aria-hidden
        onClick={confirming ? undefined : onClose}
      />
      <div className="relative w-full max-w-xl min-w-[28rem] rounded-2xl border border-slate-300 bg-white font-admin shadow-2xl">
        <div className="px-5 pt-5 pb-3 border-b border-slate-200 bg-slate-50 rounded-t-2xl">
          <h2 className="text-lg font-semibold tracking-tight text-slate-800">{title}</h2>
        </div>
        <div className="px-5 py-4 space-y-2 text-slate-700 bg-slate-50/50">
          <p>
            Are you sure you want to {actionVerb} {itemLabel}?
          </p>
          <p className="text-sm font-semibold text-rose-700">
            This action cannot be undone.
          </p>
        </div>
        <div className="flex flex-row-reverse gap-3 border-t border-slate-200 px-5 py-4 rounded-b-2xl bg-slate-100">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirming}
            className="rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 disabled:pointer-events-none disabled:opacity-60"
          >
            {confirming ? confirmingLabel : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:pointer-events-none disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
