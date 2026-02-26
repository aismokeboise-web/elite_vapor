import { useEffect, useState } from "react";

const AGE_GATE_KEY = "ageGateStatus";
const ONE_HOUR_MS = 60 * 60 * 1000;

type AgeGateStatus = {
  value: "yes";
  timestamp: number;
};

function getStoredStatus(): AgeGateStatus | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AGE_GATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AgeGateStatus;
    if (!parsed || parsed.value !== "yes" || typeof parsed.timestamp !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function AgeGate() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const status = getStoredStatus();
    if (status && Date.now() - status.timestamp < ONE_HOUR_MS) {
      setShowModal(false);
      return;
    }
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AGE_GATE_KEY);
    }
    setShowModal(true);
  }, []);

  const handleYes = () => {
    if (typeof window !== "undefined") {
      const payload: AgeGateStatus = { value: "yes", timestamp: Date.now() };
      window.localStorage.setItem(AGE_GATE_KEY, JSON.stringify(payload));
    }
    setShowModal(false);
  };

  const handleNo = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(AGE_GATE_KEY);
      window.location.href = "https://www.google.com";
    }
  };

  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 px-6 py-7 text-center shadow-2xl shadow-black/60 sm:px-8 sm:py-8">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          Are you 21 years or older?
        </h2>
        <p className="mt-3 text-sm text-slate-300">
          You must be of legal smoking age to enter this site.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleYes}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            Yes, I am 21+
          </button>
          <button
            type="button"
            onClick={handleNo}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-600 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-100 shadow-sm transition hover:border-rose-400 hover:bg-rose-500/10 hover:text-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 focus:ring-offset-slate-950"
          >
            No, take me away
          </button>
        </div>
      </div>
    </div>
  );
}

