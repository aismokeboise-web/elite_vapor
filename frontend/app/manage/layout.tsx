import type { ReactNode } from "react";
import { NavBar } from "@/components/NavBar";

export default function ManageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col admin-bg text-slate-900">
      <NavBar />
      <main className="flex flex-1 flex-col items-center px-3 py-6 sm:px-6 sm:py-8 md:px-8 lg:px-10 lg:py-10">
        <div className="w-full max-w-6xl">{children}</div>
      </main>
      <footer className="border-t border-indigo-200/80 bg-indigo-100/90 py-4 text-center text-sm font-medium text-slate-700 shadow-[0_-2px_8px_rgba(99,102,241,0.06)]">
        <div className="mx-auto max-w-6xl px-3 sm:px-6 md:px-8 lg:px-10">
          © {new Date().getFullYear()} Elite Vapor. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
