import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Send, DollarSign, User } from 'lucide-react';

export const TransferForm: React.FC = () => {
  const { user } = useAuth();
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const idempotencyKey = crypto.randomUUID();
      await api.post('/api/transfer', {
        fromId: user?.id,
        toId: parseInt(toId),
        amount: parseFloat(amount),
        idempotencyKey,
      });
      alert('Transfer successful!');
      setToId('');
      setAmount('');
    } catch (err) {
      alert('Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-10 rounded-[2.5rem] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
      
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400">
          <Send size={24} />
        </div>
        <div>
          <h3 className="text-2xl font-bold">Transfer Funds</h3>
          <p className="text-gray-500 text-sm">Send money securely across the Zenith platform.</p>
        </div>
      </div>

      <form onSubmit={handleTransfer} className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Recipient Account ID</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 z-10">
              <User size={18} />
            </div>
            <input
              type="number"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full pl-16 pr-4 py-4 rounded-2xl bg-white/[0.05] border border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all font-medium text-white placeholder-gray-600"
              placeholder="e.g. 10425"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-gray-500 ml-1">Amount to Send</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 z-10">
              <DollarSign size={18} />
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-16 pr-4 py-4 rounded-2xl bg-white/[0.05] border border-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all font-bold text-xl text-white placeholder-gray-600"
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
        >
          {loading ? 'Processing Transaction...' : (
            <>
              <Send size={22} />
              Confirm Transfer
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};
