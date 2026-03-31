import React, { useEffect, useState } from 'react';
import api from '../api';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Activity, PieChart as PieChartIcon, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await api.get(`/api/analytics/transactions?userId=${user.id}`);
      console.log(`📊 Analytics: Loaded ${res.data.length} transactions for user ${user.id}`);
      
      const sortedData = res.data.sort((a: any, b: any) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      setData(sortedData.map((d: any) => ({
        ...d,
        amount: Number(d.amount) || 0,
        time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date(d.timestamp).toLocaleDateString()
      })));
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500 animate-pulse">Analyzing financial data...</div>;

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Transaction History Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[2.5rem] h-[400px]"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-xl font-bold">Transaction Volume</h3>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={fetchAnalytics}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Refresh Data
              </button>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1 rounded-full">30 Days</span>
            </div>
          </div>
          
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
              <Tooltip 
                contentStyle={{ background: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Breakdown Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-[2.5rem] h-[400px]"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-violet-500/10 rounded-xl text-violet-400">
              <PieChartIcon size={20} />
            </div>
            <h3 className="text-xl font-bold">Flow Analysis</h3>
          </div>
          
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={data.slice(-5)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: '#ffffff05' }}
                contentStyle={{ background: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '16px' }}
              />
              <Bar dataKey="amount" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<TrendingUp />} label="Total Volume" value={`$${data.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`} color="blue" />
        <StatCard icon={<ArrowUpRight />} label="Avg. Transaction" value={`$${(data.length ? data.reduce((acc, curr) => acc + curr.amount, 0) / data.length : 0).toFixed(2)}`} color="violet" />
        <StatCard icon={<Activity />} label="Frequency" value={`${data.length} Events`} color="green" />
      </div>

      {data.length === 0 && (
        <div className="py-20 text-center glass rounded-[2.5rem] border border-white/5 opacity-40 italic">
          No analytics data available for this period. Try making a transaction.
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: 'blue' | 'violet' | 'green' }) => {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400',
    violet: 'bg-violet-500/10 text-violet-400',
    green: 'bg-green-500/10 text-green-400'
  };

  return (
    <div className="glass p-6 rounded-3xl flex items-center gap-4 border border-white/5">
      <div className={`p-4 rounded-2xl ${colorMap[color]}`}>
        {React.cloneElement(icon as any, { size: 24 })}
      </div>
      <div>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-xl font-bold text-white mb-0">{value}</p>
      </div>
    </div>
  );
};
