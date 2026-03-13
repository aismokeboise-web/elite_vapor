'use client';

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth, type UserRole } from "./AuthProvider";

interface RequireAuthProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function RequireAuth({ children, requiredRole }: RequireAuthProps) {
  const { token, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!token || !role) {
      const params = new URLSearchParams({ next: pathname || "/" });
      router.replace(`/manage/login?${params.toString()}`);
      return;
    }
    if (requiredRole && role !== requiredRole) {
      router.replace("/manage");
      return;
    }
  }, [token, role, loading, router, pathname, requiredRole]);

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center px-4 py-12">
        <p className="text-sm text-slate-700">Checking your session…</p>
      </div>
    );
  }

  if (!token || !role) {
    return null;
  }

  if (requiredRole && role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

