import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children, appRole }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storageKey = 'auth'; // single key for combined deployment

    // Handle token passed via URL query params (cross-port login from landing page)
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlUser  = params.get('user');
    if (urlToken && urlUser) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(urlUser));
        setUser(parsedUser);
        setToken(urlToken);
        localStorage.setItem(storageKey, JSON.stringify({ user: parsedUser, token: urlToken }));
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        setLoading(false);
        return;
      } catch {}
    }

    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const { user, token } = JSON.parse(stored);
        if (!appRole || user.role === appRole) {
          setUser(user);
          setToken(token);
        }
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
    setLoading(false);
  }, [appRole]);

  function login(userData, authToken) {
    const storageKey = 'auth';
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(storageKey, JSON.stringify({ user: userData, token: authToken }));
  }

  function logout() {
    const storageKey = 'auth';
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
