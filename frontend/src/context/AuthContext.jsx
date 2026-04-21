import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children, appRole }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use role-scoped storage key so HOD and VC sessions don't collide
    const storageKey = appRole ? `auth_${appRole}` : 'auth';
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored);
        // Only restore if role matches this portal
        if (!appRole || user.role === appRole) {
          setUser(user);
          setToken(token);
        }
      } catch {}
    }
    setLoading(false);
  }, [appRole]);

  function login(userData, authToken) {
    const storageKey = appRole ? `auth_${appRole}` : 'auth';
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(storageKey, JSON.stringify({ user: userData, token: authToken }));
  }

  function logout() {
    const storageKey = appRole ? `auth_${appRole}` : 'auth';
    setUser(null);
    setToken(null);
    localStorage.removeItem(storageKey);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, appRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
