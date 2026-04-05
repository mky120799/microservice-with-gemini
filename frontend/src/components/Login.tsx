import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginProps {
  onForgotPassword: () => void;
}

export const Login: React.FC<LoginProps> = ({ onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      alert('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      <div className="mesh-bg" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-12 rounded-[3rem] w-full max-w-lg relative z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20">
            <Shield size={32} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-2 text-white">Secure Access</h2>
          <p className="text-gray-400 font-medium">Enter your credentials to manage your equity.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
              <input
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
            <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Secret Key</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
              <input
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

          <button
            type="submit"
            className="w-full btn-primary py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 mt-4"
          >
            Authorize Access
            <ArrowRight size={22} />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
