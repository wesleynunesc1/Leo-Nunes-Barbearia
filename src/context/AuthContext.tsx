"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { WixMemberProfile } from "@/lib/wixAuth";

interface AuthContextType {
  member: WixMemberProfile | null;
  loading: boolean;
  refreshMember: () => Promise<WixMemberProfile | null>;
  logout: () => Promise<void>;
  initiateOAuth: (mode?: "login" | "signup", returnUrl?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<WixMemberProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMember = useCallback(async (): Promise<WixMemberProfile | null> => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      if (data.authenticated && data.member) {
        setMember(data.member);
        return data.member;
      } else {
        setMember(null);
        return null;
      }
    } catch (err) {
      console.error("[AUTH CONTEXT REFRESH ERROR]", err);
      setMember(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMember();
  }, [refreshMember]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("[AUTH CONTEXT LOGOUT ERROR]", err);
    } finally {
      setMember(null);
      window.location.href = "/login";
    }
  }, []);

  const initiateOAuth = useCallback(
    async (mode: "login" | "signup" = "login", returnUrl: string = "/minha-conta") => {
      try {
        const res = await fetch(
          `/api/auth/oauth-url?mode=${mode}&returnUrl=${encodeURIComponent(returnUrl)}`
        );
        const data = await res.json();
        if (res.ok && data.authUrl) {
          window.location.href = data.authUrl;
        } else {
          throw new Error(data.error || "Não foi possível iniciar o login no momento. Tente novamente.");
        }
      } catch (err: any) {
        console.error("[INITIATE OAUTH ERROR]", err);
        throw err;
      }
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        member,
        loading,
        refreshMember,
        logout,
        initiateOAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
