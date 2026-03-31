import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, TrendingUp, Plus } from 'lucide-react';
import { TopUp } from './TopUp';
import { TransferModal } from './TransferModal';
import { useSocket } from '../hooks/useSocket';
import { Bell, History } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const { notifications } = useSocket();

  const fetchBalance = async () => {
    try {
      const res = await api.get(`/api/ledger/balance/${user?.id}`);
      setBalance(res.data.balance);
    } catch (err) {
      console.error('Failed to fetch balance');
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/api/ledger/transactions/${user?.id}`);
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history');
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchHistory();
    }
  }, [user]);

  // Auto-refresh on new notification
  useEffect(() => {
    if (notifications.length > 0) {
      fetchBalance();
      fetchHistory();
    }
  }, [notifications]);

  return (
    <div className="space-y-6 md:space-y-10 max-w-[1600px] mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Main Balance Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="xl:col-span-2 glass p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden group min-h-[340px] flex flex-col justify-center"
        >
          <div className="absolute -top-10 -right-10 p-10 opacity-[0.03] group-hover:opacity-[0.07] transition-all duration-700 group-hover:scale-110 pointer-events-none">
            <Wallet size={280} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse" />
              <span className="text-gray-400 text-xs md:text-sm font-bold uppercase tracking-[0.2em]">Total Portfolio Capital</span>
            </div>
            
            <div className="flex items-baseline gap-2 mb-10">
              <span className="text-3xl md:text-4xl lg:text-5xl font-light text-gray-500">$</span>
              <h2 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-gradient leading-none">
                {Math.floor(balance).toLocaleString()}
                <span className="text-3xl md:text-4xl lg:text-5xl font-medium opacity-50">.{(balance % 1).toFixed(2).split('.')[1]}</span>
              </h2>
            </div>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => setIsTopUpOpen(true)}
                className="btn-primary px-10 py-4 rounded-2xl flex items-center gap-3 text-sm font-black uppercase tracking-wider"
              >
                <Plus size={20} strokeWidth={3} />
                Instant Top Up
              </button>
              <button 
                onClick={() => setIsTransferOpen(true)}
                className="glass-hover px-10 py-4 rounded-2xl flex items-center gap-3 text-sm font-black uppercase tracking-wider text-gray-300 hover:text-white"
              >
                <ArrowUpRight size={20} strokeWidth={3} />
                Send Funds
              </button>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Activity Stats Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-[2.5rem] flex flex-col justify-between border-l-4 border-l-green-500/20"
        >
          <div>
            <div className="flex justify-between items-start mb-6">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Growth Performance</span>
              <div className="px-2 py-1 bg-green-500/10 rounded-lg">
                <p className="text-[10px] font-black text-green-500 uppercase">Live</p>
              </div>
            </div>
            
            <div className="flex items-center gap-5">
              <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/5 rounded-3xl shadow-inner">
                <TrendingUp size={32} className="text-green-400" />
              </div>
              <div>
                <p className="text-4xl font-black text-white tracking-tight">+12.5%</p>
                <p className="text-[11px] text-gray-500 font-medium mt-1 italic">Consistent monthly trajectory</p>
              </div>
            </div>
          </div>
          
          <div className="pt-10 space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Monthly Yield</p>
                <p className="text-2xl font-bold text-white tracking-snug">$4,250.00</p>
              </div>
              <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[70%] h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              </div>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Burn</p>
                <p className="text-2xl font-bold text-red-500/80 tracking-snug">$1,120.45</p>
              </div>
              <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-[30%] h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-8">
        {/* Detailed Transaction History */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1 xl:col-span-3 glass p-8 rounded-[2.5rem] flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-2xl">
                <History size={24} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">Recent Activity</h3>
                <p className="text-xs text-gray-500 font-medium">Real-time ledger audit</p>
              </div>
            </div>
            <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors">
              View All
            </button>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[420px]">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 opacity-20 text-center">
                <History size={48} className="mb-4" />
                <p className="text-sm font-medium italic">Your financial timeline is empty</p>
              </div>
            ) : (
              history.map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.06] transition-all duration-300 group">
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${
                      tx.type === 'CREDIT' ? 'bg-green-500/10 text-green-500' : 
                      tx.fromAccountId === user?.id ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                    }`}>
                      {tx.type === 'CREDIT' ? <Plus size={20} strokeWidth={3} /> : 
                       tx.fromAccountId === user?.id ? <ArrowUpRight size={20} strokeWidth={3} /> : <ArrowDownLeft size={20} strokeWidth={3} />}
                    </div>
                    <div>
                      <p className="text-base font-black text-white">
                        {tx.type === 'CREDIT' ? 'Global Deposit' : 
                         tx.fromAccountId === user?.id ? `Payment to User #${tx.toAccountId}` : `Incoming: User #${tx.fromAccountId}`}
                      </p>
                      <p className="text-[11px] text-gray-500 font-bold mt-0.5 uppercase tracking-wider">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className={`text-xl font-black tracking-tight ${tx.type === 'CREDIT' || tx.toAccountId === user?.id ? 'text-green-500' : 'text-red-400'}`}>
                      {tx.type === 'CREDIT' || tx.toAccountId === user?.id ? '+' : '-'}${parseFloat(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    <span className="text-[10px] text-gray-600 font-bold uppercase mt-1">Settled</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Live System Notifications */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1 xl:col-span-2 glass p-8 rounded-[2.5rem] border-t-4 border-t-violet-500/30"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-500/10 rounded-2xl">
                <Bell size={24} className="text-violet-400" />
              </div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">System Intel</h3>
                <p className="text-xs text-gray-500 font-medium">Real-time alerts</p>
              </div>
            </div>
            {notifications.length > 0 && (
              <span className="px-3 py-1 bg-violet-500/20 text-violet-400 text-[10px] font-black rounded-full animate-pulse uppercase">
                {notifications.length} Current
              </span>
            )}
          </div>
          
          <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
            {notifications.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-[280px] opacity-10 text-center">
                 <Bell size={64} className="mb-6" />
                 <p className="text-sm font-bold uppercase tracking-widest">Awaiting system broadcast...</p>
               </div>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className="flex items-start gap-5 p-5 rounded-3xl bg-violet-500/5 border border-violet-500/10 hover:bg-violet-500/10 transition-all duration-300">
                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.6)] mt-2 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-violet-100 font-medium leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-violet-400/60 font-black mt-2 uppercase tracking-wide">Just Now</p>
                    </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <TopUp 
        isOpen={isTopUpOpen} 
        onClose={() => setIsTopUpOpen(false)} 
        onSuccess={() => {
          setIsTopUpOpen(false);
          fetchBalance();
          fetchHistory();
        }}
      />

      <TransferModal
        isOpen={isTransferOpen}
        onClose={() => setIsTransferOpen(false)}
        onSuccess={() => {
          setIsTransferOpen(false);
          fetchBalance();
          fetchHistory();
        }}
      />
    </div>
  );
};

