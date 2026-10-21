import { createContext, useContext, useEffect, useState } from "react";
import { getAdminProfile, loginAdmin, logoutAdmin } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function checkAuth() {
    try {
      const data = await getAdminProfile();
      if (data?.ok && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function login(identifier, password) {
    const data = await loginAdmin(identifier, password);
    if (data?.ok && data.user) {
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.error || "Login failed.");
  }

  async function logout() {
    try {
      await logoutAdmin();
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser: checkAuth,
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

