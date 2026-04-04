"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (data: RegisterData) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || "Login failed" };
      }
      setUser(data.data.user);
      router.push("/feed");
      return {};
    } catch {
      return { error: "Network error. Please try again." };
    }
  };

  const register = async (
    formData: RegisterData
  ): Promise<{ error?: string }> => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) {
          const firstError = Object.values(data.errors)[0] as string[];
          return { error: firstError[0] };
        }
        return { error: data.error || "Registration failed" };
      }
      setUser(data.data.user);
      router.push("/feed");
      return {};
    } catch {
      return { error: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
