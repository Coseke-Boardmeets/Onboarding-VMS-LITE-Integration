"use client";

import React, { createContext, useContext, useState } from "react";

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
  const [user] = useState<User | null>({
    id: "bypass-admin-id",
    email: "admin@coseke.com",
    fullName: "System Administrator",
  });
  const [loading] = useState(false);

  const login = async (_email: string, _password: string) => {
    // No-op bypass
  };

  const logout = () => {
    // No-op bypass
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
