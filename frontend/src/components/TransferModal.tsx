import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('💸 Submitting transfer request...');
    setLoading(true);
    setError(null);

    try {
      const payload = {
        fromId: user?.id,
        toId: parseInt(toId),
        amount: parseFloat(amount),
        idempotencyKey: `transfer-${user?.id}-${Date.now()}`,
      };
      console.log('📦 Transfer Payload:', payload);

      const res = await api.post('/api/transfer', payload);
      console.log('✅ Transfer Response:', res.data);

      setSuccess(true);
      window.alert('Transfer successful!');
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Transfer failed. Check recipient ID and balance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass w-full max-w-md p-8 rounded-[2.5rem] relative"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-500/10 rounded-2xl">
                <Send size={24} className="text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold">Transfer Funds</h2>
            </div>

            {success ? (
              <div className="py-12 flex flex-col items-center gap-4 text-center">
                <div className="p-4 bg-green-500/10 rounded-full">
                  <CheckCircle2 size={48} className="text-green-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider">Transfer Sent!</h3>
                  <p className="text-gray-400 text-sm mt-2">The recipient account has been credited.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Recipient User ID</label>
                  <input
                    type="number"
                    value={toId}
                    onChange={(e) => setToId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500/50 transition-colors text-white"
                    placeholder="Enter User ID (e.g. 2)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Amount ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-blue-500/50 transition-colors text-white"
                    placeholder="0.00"
                    step="0.01"
                    min="1"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm">
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (
                    <>
                      Send Now
                      <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
