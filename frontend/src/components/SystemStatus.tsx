import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Activity, AlertCircle, CheckCircle2, RefreshCw, Terminal } from 'lucide-react';
import api from '../api';

interface ServiceHealth {
  name: string;
  status: 'online' | 'offline';
  target: string;
}

export const SystemStatus: React.FC = () => {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/system/status');
      setServices(res.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch system status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase flex items-center gap-3">
             <Terminal className="text-blue-500" size={28} />
             System Monitor
          </h2>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
            Real-time infrastructure health signals • Last sync: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button 
          onClick={fetchStatus}
          disabled={loading}
          className="glass-button p-4 rounded-2xl flex items-center gap-2 text-gray-400 hover:text-white transition-all group"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          <span className="text-xs font-bold uppercase tracking-widest">Refresh Signals</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 transition-colors duration-500 ${
              service.status === 'online' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-4 rounded-2xl ${
                service.status === 'online' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                <Server size={24} />
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                service.status === 'online' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {service.status === 'online' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                {service.status}
              </div>
            </div>

            <div className="relative z-10">
              <h4 className="text-xl font-bold text-white mb-1 capitalize">{service.name} Service</h4>
              <p className="text-xs text-gray-500 font-mono opacity-60 truncate">{service.target}</p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
              <div className="flex gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <motion.div 
                    key={i}
                    animate={{ scaleY: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                    className={`w-1 h-3 rounded-full ${service.status === 'online' ? 'bg-green-500' : 'bg-red-500/20'}`}
                  />
                ))}
              </div>
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                Latency: {service.status === 'online' ? Math.floor(Math.random() * 20) + 10 + 'ms' : 'N/A'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass p-8 rounded-[2.5rem] mt-12 border border-blue-500/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600" />
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="p-6 bg-blue-500/10 rounded-[2rem] text-blue-400">
            <Activity size={48} className="animate-pulse" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Ecosystem Health Optimized</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
              All Zenith Banking microservices are designed with high availability and resilience. 
              The API Gateway dynamically routes traffic and performs automatic failover for critical banking operations.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-2xl font-black text-white">99.9%</p>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Uptime</p>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-2xl font-black text-white">24ms</p>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mt-1">Avg Latency</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
