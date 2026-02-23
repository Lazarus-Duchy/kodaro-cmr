import { createContext, useContext, useState, useEffect } from 'react';
import { auth as apiAuth, tokens, get } from '../api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]           = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading]     = useState(true); // true while verifying session on mount

  // ── Restore session on mount ───────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = tokens.getAccess();
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        // Verify token is still valid by fetching current user
        const userData = await get('/users/me/');
        setUser(userData);
        setIsLoggedIn(true);
      } catch {
        // Token expired or invalid — try refresh happens automatically in api.js interceptor.
        // If it also fails, the interceptor clears tokens; we just reset state here.
        tokens.clear();
        setUser(null);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (credentials) => {
    const data = await apiAuth.login(credentials); // stores tokens automatically
    setUser(data.user);
    setIsLoggedIn(true);
    return data;
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await apiAuth.logout(); // blacklists refresh token, clears localStorage
    } catch {
      // Even if the server call fails, clear local state
      tokens.clear();
    } finally {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;