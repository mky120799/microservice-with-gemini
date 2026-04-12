import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

interface User {
  id: number;
  email: string;
  role: string;
  isTwoFactorEnabled: boolean;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  twoFactorPending: boolean;
  login: (email: string, password: string, token?: string) => Promise<void>;
  verify2FA: (token: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setup2FA: () => Promise<{ qrCodeDataURL: string; secret: string }>;
  enable2FA: (token: string) => Promise<void>;
  disable2FA: () => Promise<void>;
  updateProfile: (profile: { name?: string; avatarUrl?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zenith_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(() => !localStorage.getItem('zenith_user'));
  const [twoFactorPending, setTwoFactorPending] = useState(false);
  // hold credentials temporarily while waiting for 2FA token
  const [pendingCredentials, setPendingCredentials] = useState<{ email: string; password: string } | null>(null);

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

  const login = async (email: string, password: string, token?: string) => {
    const res = await api.post('/api/users/signin', { email, password, token });

    if (res.data.twoFactorRequired) {
      // Server says 2FA needed — hold credentials and flip flag
      setPendingCredentials({ email, password });
      setTwoFactorPending(true);
      return;
    }

    const userData = res.data;
    setUser(userData);
    localStorage.setItem('zenith_user', JSON.stringify(userData));
    setTwoFactorPending(false);
    setPendingCredentials(null);
  };

  const verify2FA = async (token: string) => {
    if (!pendingCredentials) throw new Error('No pending credentials');
    await login(pendingCredentials.email, pendingCredentials.password, token);
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
    setTwoFactorPending(false);
    setPendingCredentials(null);
    localStorage.removeItem('zenith_user');
    localStorage.removeItem('zenith_view');
  };

  const setup2FA = async () => {
    const res = await api.post('/api/users/2fa/setup');
    return res.data as { qrCodeDataURL: string; secret: string };
  };

  const enable2FA = async (token: string) => {
    await api.post('/api/users/2fa/verify', { token });
  };

  const disable2FA = async () => {
    await api.post('/api/users/2fa/disable');
  };

  const updateProfile = async (profileData: { name?: string; avatarUrl?: string }) => {
    const res = await api.patch('/api/users/profile', profileData);
    const updatedUser = res.data;
    setUser(updatedUser);
    localStorage.setItem('zenith_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, loading, twoFactorPending, login, verify2FA, signup, logout, setup2FA, enable2FA, disable2FA, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
