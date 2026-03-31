import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Smartphone, Fingerprint, Eye, EyeOff } from 'lucide-react';

export const Security: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Password Management */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass p-8 rounded-[2.5rem] space-y-6"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <Lock size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Access Control</h3>
              <p className="text-xs text-gray-500 font-medium">Secure your portal</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Current Password</label>
              <div className="relative group">
                <input 
                  type="password" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm"
                  placeholder="••••••••••••"
                />
                <EyeOff size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-white transition-colors" />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">New Secure Key</label>
              <div className="relative">
                <input 
                  type="password" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm"
                  placeholder="At least 12 characters"
                />
              </div>
            </div>

            <button className="w-full btn-primary py-4 rounded-2xl text-xs font-black uppercase tracking-widest mt-4">
              Update Credentials
            </button>
          </div>
        </motion.div>

        {/* Multi-Factor Auth */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-[2.5rem] space-y-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-violet-500/10 rounded-2xl">
              <Smartphone size={24} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Two-Factor Auth</h3>
              <p className="text-xs text-gray-500 font-medium">Extra layer of defense</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-500/10 rounded-xl">
                  <Fingerprint size={20} className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">Biometric Unlock (Mock)</p>
                  <p className="text-[10px] text-gray-500">Enable FaceID or TouchID</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-blue-600 rounded-full relative flex items-center px-1 cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/10 opacity-50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-gray-500/10 rounded-xl text-gray-400">
                  <Smartphone size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold">SMS Verification (Mock)</p>
                  <p className="text-[10px] text-gray-500">Managed via hardware portal</p>
                </div>
              </div>
              <div className="w-12 h-6 bg-white/10 rounded-full relative flex items-center px-1 cursor-not-allowed">
                <div className="w-4 h-4 bg-gray-600 rounded-full shadow-sm" />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <p className="text-[10px] text-blue-300/80 font-medium leading-relaxed italic text-center">
              "Actual MFA integration requires backend protocol updates."
            </p>
          </div>
        </motion.div>
      </div>

      {/* Active Sessions */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass p-8 rounded-[2.5rem]"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-2xl">
              <Eye size={24} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Active Sessions</h3>
              <p className="text-xs text-gray-500 font-medium">Log of active hardware portals</p>
            </div>
          </div>
          <button className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-white transition-colors">
            End All
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/5 rounded-2xl text-blue-400">
                <Smartphone size={24} />
              </div>
              <div>
                <p className="text-base font-black text-white">iPhone 15 Pro Max • App</p>
                <p className="text-[11px] text-gray-500 font-bold mt-0.5 uppercase tracking-wider">San Francisco, CA • Current Session</p>
              </div>
            </div>
            <div className="px-3 py-1 bg-green-500/10 rounded-lg">
              <p className="text-[10px] font-black text-green-500 uppercase">Active</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/[0.04] opacity-40">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/5 rounded-2xl text-gray-400">
                {/* Macbook Icon placeholder */}
                <Smartphone size={24} />
              </div>
              <div>
                <p className="text-base font-black text-white">MacBook Pro 16" • Chrome</p>
                <p className="text-[11px] text-gray-500 font-bold mt-0.5 uppercase tracking-wider">New York, NY • 2 hours ago</p>
              </div>
            </div>
            <button className="text-[10px] font-black text-gray-500 uppercase hover:text-white transition-colors">Revoke</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
