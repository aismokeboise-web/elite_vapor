"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../components/AuthProvider";

export function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
}

export function useAuthenticatedFetch() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    async (path: string, init?: RequestInit): Promise<Response> => {
      const base = getBackendUrl();
      const url = path.startsWith("http") ? path : `${base}${path}`;
      const res = await fetch(url, {
        ...init,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          ...(init?.headers as Record<string, string>),
        },
      });
      if (res.status === 401) {
        logout();
        const next = pathname
          ? `/manage/login?next=${encodeURIComponent(pathname)}`
          : "/manage/login";
        router.replace(next);
        throw new Error("Unauthorized");
      }
      return res;
    },
    [token, logout, router, pathname]
  );
}
