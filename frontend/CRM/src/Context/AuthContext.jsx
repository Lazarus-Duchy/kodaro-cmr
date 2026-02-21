import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('clientflow_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem('clientflow_user');
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem('clientflow_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('clientflow_user');
  };

  const register = (userData) => {
    // In a real app this would hit an API
    // For now, just save to localStorage as "registered users"
    const users = JSON.parse(localStorage.getItem('clientflow_users') || '[]');
    const exists = users.find(u => u.email === userData.email);
    if (exists) {
      throw new Error('Użytkownik z tym adresem email już istnieje.');
    }
    users.push(userData);
    localStorage.setItem('clientflow_users', JSON.stringify(users));
    login(userData);
  };

  const validateLogin = (email, password) => {
    const users = JSON.parse(localStorage.getItem('clientflow_users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Nieprawidłowy email lub hasło.');
    }
    login(user);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout, register, validateLogin }}>
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
