"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/lib/apiClient";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from token on mount
  useEffect(() => {
    async function loadUser() {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        try {
          const res = await apiClient.get("/auth/me") as { user: User };
          if (res && res.user) {
            setUser(res.user);
          } else {
            if (typeof window !== "undefined") localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Failed to load user session", error);
          if (typeof window !== "undefined") localStorage.removeItem("token");
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiClient.post("/auth/login", { email, password }) as { user: User; token: string };
      if (res && res.token && res.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", res.token);
        }
        setUser(res.user);
        router.push("/");
      } else {
        throw new Error("Invalid login response format");
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
