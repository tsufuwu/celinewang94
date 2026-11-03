"use client";

import * as React from "react";
import { type AuthUser } from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  loginWithGoogle: (returnTo?: string) => void;
  logout: () => void;
  updateNickname: (nickname: string) => Promise<{ success: boolean; error?: string }>;
  isChapterUnlocked: (chapterId: string) => boolean;
  saveUnlockedChapter: (chapterId: string) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
}) {
  const [user, setUser] = React.useState<AuthUser | null>(initialUser);
  const [isLoading, setIsLoading] = React.useState(false);

  const refreshSession = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = (await res.json()) as { user: AuthUser | null };
        setUser(data.user);
      }
    } catch {
      // offline or error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = React.useCallback((returnTo?: string) => {
    const currentPath =
      returnTo || (typeof window !== "undefined" ? window.location.pathname : "/");
    window.location.href = `/api/auth/google?returnTo=${encodeURIComponent(currentPath)}`;
  }, []);

  const logout = React.useCallback(() => {
    window.location.href = "/api/auth/logout";
  }, []);

  const updateNickname = React.useCallback(async (nickname: string) => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser((prev) => (prev ? { ...prev, nickname } : null));
        return { success: true };
      }
      return { success: false, error: data.error || "Không thể cập nhật biệt danh" };
    } catch {
      return { success: false, error: "Lỗi kết nối máy chủ" };
    }
  }, []);

  const isChapterUnlocked = React.useCallback(
    (chapterId: string) => {
      if (!user) return false;
      return (user.unlockedChapters || []).includes(chapterId);
    },
    [user]
  );

  const saveUnlockedChapter = React.useCallback(async (chapterId: string) => {
    if (!chapterId) return;
    try {
      // Optimistic update
      setUser((prev) => {
        if (!prev) return null;
        const current = new Set(prev.unlockedChapters || []);
        current.add(chapterId);
        return { ...prev, unlockedChapters: Array.from(current) };
      });

      await fetch("/api/user/unlock-chapter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId }),
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithGoogle,
        logout,
        updateNickname,
        isChapterUnlocked,
        saveUnlockedChapter,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

