import { useMemo, useRef,useEffect, useState } from "react";

export interface CategoryFilterOption {
  id: string;
  name: string;
}

interface CategoryFilterDropdownProps {
  id?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: CategoryFilterOption[];
  allLabel?: string;
}

export function CategoryFilterDropdown({
  id,
  label = "Category:",
  value,
  onChange,
  options,
  allLabel = "All categories",
}: CategoryFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedLabel = useMemo(() => {
    if (!value) return allLabel;
    const match = options.find((o) => o.id === value);
    return match?.name ?? value;
  }, [value, options, allLabel]);

  useMemo(() => options, [options]); // keep options in memo scope for type-checking

  useMemo(() => selectedLabel, [selectedLabel]); // stabilize label

  useMemo(() => allLabel, [allLabel]); // stabilize allLabel

  useMemo(() => value, [value]); // stabilize value

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSelect = (next: string) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <div className="flex w-full flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
      {label && (
        <label
          htmlFor={id}
          className="whitespace-nowrap text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <div
        ref={containerRef}
        className="relative w-full min-w-[9rem] sm:w-auto"
      >
        <button
          type="button"
          id={id}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm sm:text-base text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <span className="truncate">{selectedLabel}</span>
          <svg
            className="ml-2 h-4 w-4 shrink-0 text-slate-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {open && (
          <div className="absolute right-0 z-20 mt-1 w-56 max-w-xs rounded-lg border border-slate-200 bg-white py-2 shadow-lg sm:w-64">
            <div className="max-h-60 overflow-y-auto">
              <button
                type="button"
                onClick={() => handleSelect("")}
                className={`flex w-full items-center px-3 py-2 text-left text-xs sm:text-sm ${
                  !value
                    ? "bg-indigo-50 text-indigo-800"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                {allLabel}
              </button>
              {options.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`flex w-full items-center px-3 py-2 text-left text-xs sm:text-sm ${
                    value === opt.id
                      ? "bg-indigo-50 text-indigo-800"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

