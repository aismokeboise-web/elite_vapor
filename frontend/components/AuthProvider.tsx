'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type UserRole = "admin" | "subadmin";

export interface Privilege {
  resource: string;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canReply?: boolean;
}

interface AuthState {
  token: string | null;
  role: UserRole | null;
  privileges: Privilege[] | null;
  hasLoggedInOnce: boolean | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (args: {
    token: string;
    role: UserRole;
    privileges?: Privilege[] | null;
    hasLoggedInOnce?: boolean | null;
  }) => void;
  logout: () => void;
  can: (resource: string, action: "create" | "update" | "delete" | "reply") => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "elite-admin-auth";

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    ) as { exp?: number };
    if (typeof decoded.exp !== "number") return true;
    return Date.now() / 1000 >= decoded.exp;
  } catch {
    return true;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    role: null,
    privileges: null,
    hasLoggedInOnce: null,
    loading: true,
  });

  // Hydrate from localStorage on mount; reject expired tokens (2h validity)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setState((s) => ({ ...s, loading: false }));
        return;
      }
      const parsed = JSON.parse(raw) as {
        token?: string | null;
        role?: UserRole | null;
        privileges?: Privilege[] | null;
        hasLoggedInOnce?: boolean | null;
      };
      const token = parsed.token ?? null;
      const role = parsed.role ?? null;
      const privileges = parsed.privileges ?? null;
      const hasLoggedInOnce = parsed.hasLoggedInOnce ?? null;
      if (!token || !role || isTokenExpired(token)) {
        window.localStorage.removeItem(STORAGE_KEY);
        setState({ token: null, role: null, privileges: null, hasLoggedInOnce: null, loading: false });
        return;
      }
      setState({ token, role, privileges, hasLoggedInOnce, loading: false });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  // Persist to localStorage whenever token/role/privileges changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!state.token || !state.role) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const payload = JSON.stringify({
      token: state.token,
      role: state.role,
      privileges: state.privileges,
      hasLoggedInOnce: state.hasLoggedInOnce,
    });
    window.localStorage.setItem(STORAGE_KEY, payload);
  }, [state.token, state.role, state.privileges, state.hasLoggedInOnce]);

  const login = useCallback(
    (args: {
      token: string;
      role: UserRole;
      privileges?: Privilege[] | null;
      hasLoggedInOnce?: boolean | null;
    }) => {
      setState({
        token: args.token,
        role: args.role,
        privileges: args.privileges ?? null,
        hasLoggedInOnce: args.hasLoggedInOnce ?? null,
        loading: false,
      });
    },
    []
  );

  const logout = useCallback(() => {
    setState({
      token: null,
      role: null,
      privileges: null,
      hasLoggedInOnce: null,
      loading: false,
    });
  }, []);

  const can = useCallback(
    (resource: string, action: "create" | "update" | "delete" | "reply"): boolean => {
      if (state.role === "admin") return true;
      if (state.role !== "subadmin" || !state.privileges) return false;
      const p = state.privileges.find((x) => x.resource === resource);
      if (!p) return false;
      if (action === "create") return p.canCreate;
      if (action === "update") return p.canUpdate;
      if (action === "delete") return p.canDelete;
      if (action === "reply") return p.canReply === true;
      return false;
    },
    [state.role, state.privileges]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      logout,
      can,
    }),
    [state, login, logout, can]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

