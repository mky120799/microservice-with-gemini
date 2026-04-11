import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';

const GATEWAY = 'http://localhost:8000';

interface LoginProps {
  onForgotPassword: () => void;
}

export const Login: React.FC<LoginProps> = ({ onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, verify2FA, twoFactorPending } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.errors?.[0]?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await verify2FA(totpToken);
    } catch (err: any) {
      setError(err?.response?.data?.errors?.[0]?.message || 'Invalid 2FA token.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${GATEWAY}/api/users/auth/google`;
  };

  const handleAuth0Login = () => {
    window.location.href = `${GATEWAY}/api/users/auth/auth0`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      <div className="mesh-bg" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-12 rounded-[3rem] w-full max-w-lg relative z-10"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20">
            <Shield size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-2 text-white">Secure Access</h2>
          <p className="text-gray-400 font-medium">
            {twoFactorPending
              ? 'Enter your 6-digit authenticator code.'
              : 'Enter your credentials to manage your equity.'}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 2: 2FA Token ── */}
          {twoFactorPending ? (
            <motion.form
              key="2fa"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              onSubmit={handle2FA}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                  Authenticator Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
                  <input
                    id="totp-input"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={totpToken}
                    onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white/[0.05] border border-white/5 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:bg-white/10 transition-all font-mono text-2xl tracking-[0.5em] text-white placeholder-gray-600 text-center"
                    placeholder="000000"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <button
                id="verify-2fa-btn"
                type="submit"
                disabled={isLoading || totpToken.length < 6}
                className="w-full btn-primary py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? 'Verifying…' : 'Verify & Access'}
                <ArrowRight size={22} />
              </button>
            </motion.form>
          ) : (
            /* ── Step 1: Email / Password + Social ── */
            <motion.div
              key="credentials"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="space-y-6"
            >
              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="google-login-btn"
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/[0.06] border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-semibold text-white"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>

                <button
                  id="auth0-login-btn"
                  type="button"
                  onClick={handleAuth0Login}
                  className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/[0.06] border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm font-semibold text-white"
                >
                  {/* Auth0 icon */}
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="12" fill="#EB5424"/>
                    <path d="M16.924 7.262H7.076L4.8 12l7.2 5.252L19.2 12l-2.276-4.738zM12 15.462L8.717 12 12 8.538 15.283 12 12 15.462z" fill="white"/>
                  </svg>
                  Auth0
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center gap-4">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
                    <input
                      id="email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white/[0.05] border border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all font-medium text-white placeholder-gray-600"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">
                    Secret Key
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
                    <input
                      id="password-input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-16 pr-6 py-4 rounded-2xl bg-white/[0.05] border border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all font-medium text-white placeholder-gray-600"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-xs text-blue-500 hover:text-blue-400 mt-2 ml-1"
                  >
                    Forgot your secret key?
                  </button>
                </div>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isLoading ? 'Authenticating…' : 'Authorize Access'}
                  <ArrowRight size={22} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
