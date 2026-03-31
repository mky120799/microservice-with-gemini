import React, { useEffect, useState } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { History, ArrowUpRight, ArrowDownLeft, Clock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Transactions: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await api.get(`/api/ledger/transactions/${user.id}`);
        // Map ledger entity properties to UI component properties
        const mapped = res.data.map((tx: any) => ({
          ...tx,
          from: tx.fromAccountId,
          to: tx.toAccountId,
          timestamp: tx.createdAt,
        }));
        setTransactions(mapped);
      } catch (err) {
        console.error('Failed to fetch transactions');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [user]);

  if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse">Loading transaction registry...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl"
    >
      <div className="p-8 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/10 text-blue-400 rounded-2xl">
            <History size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Transaction History</h3>
            <p className="text-gray-500 text-sm font-medium">Complete record of your financial activity.</p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 bg-white/[0.01]">
              <th className="px-8 py-6">Type</th>
              <th className="px-8 py-6">Recipient/Sender</th>
              <th className="px-8 py-6 text-right">Amount</th>
              <th className="px-8 py-6 text-right">Timestamp</th>
              <th className="px-8 py-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {transactions.map((tx, i) => (
              <motion.tr 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="px-8 py-6 text-sm font-bold text-gray-300">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tx.from === user?.id ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                      {tx.from === user?.id ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                    </div>
                    {tx.from === user?.id ? 'Outgoing' : 'Incoming'}
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-gray-400">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-gray-600" />
                    ID: {tx.from === user?.id ? tx.to : tx.from}
                  </div>
                </td>
                <td className={`px-8 py-6 text-sm font-bold text-right ${tx.from === user?.id ? 'text-white' : 'text-green-400'}`}>
                  {tx.from === user?.id ? '-' : '+'}${tx.amount.toLocaleString()}
                </td>
                <td className="px-8 py-6 text-sm font-medium text-gray-500 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Clock size={12} />
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                    Settled
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {transactions.length === 0 && (
          <div className="py-20 text-center text-gray-600 font-medium">
            No transactions found in this period.
          </div>
        )}
      </div>
    </motion.div>
  );
};
