import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zenith_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(() => !localStorage.getItem('zenith_user'));

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/users/currentuser');
        if (res.data.currentUser) {
          const userData = res.data.currentUser;
          setUser(userData);
          localStorage.setItem('zenith_user', JSON.stringify(userData));
        } else {
          setUser(null);
          localStorage.removeItem('zenith_user');
        }
      } catch (err) {
        setUser(null);
        localStorage.removeItem('zenith_user');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/users/signin', { email, password });
    const userData = res.data;
    setUser(userData);
    localStorage.setItem('zenith_user', JSON.stringify(userData));
  };

  const signup = async (email: string, password: string) => {
    const res = await api.post('/api/users/signup', { email, password });
    const userData = res.data;
    setUser(userData);
    localStorage.setItem('zenith_user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await api.post('/api/users/signout');
    } catch (err) {
      console.error('Logout error', err);
    }
    setUser(null);
    localStorage.removeItem('zenith_user');
    localStorage.removeItem('zenith_view');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
