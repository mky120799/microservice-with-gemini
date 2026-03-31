import React from 'react';
import { useSocket } from '../hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ArrowDownLeft, Info } from 'lucide-react';

export const NotificationList: React.FC = () => {
  const { notifications } = useSocket();

  return (
    <div className="space-y-8 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <Bell size={24} className="text-blue-400" />
          Recent Activity
        </h3>
        <span className="text-xs font-bold bg-white/5 px-3 py-1 rounded-full text-gray-400 uppercase tracking-widest leading-none">
          Live
        </span>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {notifications.map((n, i) => (
            <motion.div
              key={i}
              initial={{ x: 50, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="glass p-6 rounded-3xl relative overflow-hidden group glass-hover"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${
                  n.message.includes('received') 
                  ? 'bg-green-500/10 text-green-500' 
                  : 'bg-blue-500/10 text-blue-500'
                }`}>
                  {n.message.includes('received') ? <ArrowDownLeft size={20} /> : <Info size={20} />}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-200">{n.message}</p>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mt-2">
                    {new Date(n.timestamp).toLocaleString(undefined, { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {notifications.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center glass rounded-3xl border-dashed"
            >
              <div className="p-4 bg-white/5 rounded-full mb-4">
                <Bell size={32} className="text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">No activity detected</p>
              <p className="text-gray-600 text-xs mt-1">Incoming transactions will appear here.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
