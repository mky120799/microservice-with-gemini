import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, ShieldCheck, Calendar, Trophy, Zap, CreditCard, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Hero Profile Section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass p-10 rounded-[3rem] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <User size={200} className="text-blue-500" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-600 via-violet-600 to-indigo-600 p-1 shadow-2xl shadow-blue-500/20">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-5xl font-black text-blue-400 border border-white/10 ring-4 ring-white/5">
              {user.email[0].toUpperCase()}
            </div>
          </div>
          
          <div className="text-center md:text-left space-y-4">
            <div>
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <h2 className="text-4xl font-black tracking-tighter text-gradient">
                  {user.email.split('@')[0]}
                </h2>
                <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                  Gold Agent
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500 font-bold text-sm tracking-tight capitalize">
                <p className="flex items-center gap-1.5"><Mail size={16} /> {user.email}</p>
                <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                <p className="flex items-center gap-1.5"><Calendar size={16} /> Joined March 2026</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
              <button className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-xs font-black uppercase tracking-widest">
                Edit Identification
              </button>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                Upgrade Tier
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Tier Status Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-[2.5rem] space-y-6 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight">Active Status</h3>
            <ShieldCheck size={24} className="text-green-500" />
          </div>
          
          <div className="space-y-4">
            <div className="p-5 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Tier Evolution</p>
                <p className="text-xs font-black text-blue-400">82%</p>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 w-[82%]" />
              </div>
              <p className="text-[10px] text-gray-400 mt-3 font-medium">Next rank: **Zenith Executive**</p>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/[0.05]">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                    <Trophy size={20} />
                </div>
                <div>
                    <p className="text-sm font-bold">Transaction King</p>
                    <p className="text-[10px] text-gray-500">Completed 12 transfers today</p>
                </div>
            </div>
          </div>
        </motion.div>

        {/* Account Details & Methods */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass p-8 rounded-[2.5rem]"
        >
          <h3 className="text-xl font-black tracking-tight mb-8">Hardware & Methods</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer group">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-black rounded-2xl flex items-center justify-center text-white border border-white/10 ring-1 ring-white/5">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="font-black text-white">Zenith Obsidian Card</p>
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1">Primary Payment Protocol • **** 8821</p>
                    </div>
                </div>
                <ChevronRight size={20} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
            </div>

            <div className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer group">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400 border border-blue-500/10">
                        <Zap size={24} />
                    </div>
                    <div>
                        <p className="font-black text-white">Instant Flash Settlements</p>
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1 text-green-500/60">Active Optimization Enabled</p>
                    </div>
                </div>
                <ChevronRight size={20} className="text-gray-600 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
