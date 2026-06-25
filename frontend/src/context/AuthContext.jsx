import { createContext, useContext, useMemo, useState } from "react";
import { apiRequest, clearSession, getStoredSession, storeSession } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const stored = getStoredSession();
  const [user, setUser] = useState(stored.user);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(stored.access));

  async function login({ username, password }) {
    const tokens = await apiRequest("/api/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });

    storeSession({ access: tokens.access, refresh: tokens.refresh, user: { username } });
    const profile = await apiRequest("/api/auth/me/");
    storeSession({ user: profile });
    setUser(profile);
    setIsAuthenticated(true);
    return profile;
  }

  async function register(form) {
    const data = await apiRequest("/api/auth/register/", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const nextUser = data.user;
    storeSession({ access: data.tokens.access, refresh: data.tokens.refresh, user: nextUser });
    setUser(nextUser);
    setIsAuthenticated(true);
    return nextUser;
  }

  function logout() {
    clearSession();
    setUser(null);
    setIsAuthenticated(false);
  }

  const value = useMemo(() => ({ user, isAuthenticated, login, register, logout }), [user, isAuthenticated]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
