import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Moon, Globe, Shield, Monitor, Smartphone, Volume2, Database, Trash2 } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-10 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Visual & Theme */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass p-8 rounded-[2.5rem] space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl">
              <Monitor size={24} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Interface</h3>
              <p className="text-xs text-gray-500 font-medium">Customize your terminal</p>
            </div>
          </div>

          <div className="space-y-6">
            <SettingToggle icon={<Moon size={18} />} title="Midnight Protocol" description="Override system theme for deep blacks" active />
            <SettingToggle icon={<Monitor size={18} />} title="Glass Morphism" description="Advanced blurring for visual depth" active />
            <SettingToggle icon={<Volume2 size={18} />} title="Haptic Signals" description="Subtle audio feedback on actions" />
          </div>
        </motion.div>

        {/* Global Access */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-[2.5rem] space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl">
              <Globe size={24} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Global Prefs</h3>
              <p className="text-xs text-gray-500 font-medium">Language & Regional Sync</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-3xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-black">EN</div>
                    <p className="text-sm font-bold">Terminal Language</p>
                </div>
                <select className="bg-transparent text-xs font-black uppercase text-blue-400 outline-none cursor-pointer">
                    <option>International English</option>
                    <option>Standard Mandarin</option>
                    <option>European Spanish</option>
                </select>
            </div>
            <SettingToggle icon={<Globe size={18} />} title="Auto Location" description="Smart currency & timezone matching" active />
          </div>
        </motion.div>

      </div>

      {/* Notifications Management */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass p-8 rounded-[2.5rem]"
      >
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-blue-500/10 rounded-2xl">
            <Bell size={24} className="text-blue-400" />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight">Signal Feed</h3>
            <p className="text-xs text-gray-500 font-medium">Manage how you receive encryption signals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <SettingToggle icon={<Smartphone size={18} />} title="Push Alerts" description="Instant mobile hardware pings" active />
            <SettingToggle icon={<Globe size={18} />} title="Web Signals" description="Browser level terminal pings" active />
            <SettingToggle icon={<Shield size={18} />} title="Security Alerts" description="Critical hardware breach signals" active />
            <SettingToggle icon={<Database size={18} />} title="Transaction Logs" description="Every settlement confirmation" />
        </div>
      </motion.div>

      {/* Critical Zone */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-8 rounded-[2.5rem] bg-red-500/5 border border-red-500/10 flex items-center justify-between"
      >
        <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500">
                <Trash2 size={24} />
            </div>
            <div>
                <p className="text-lg font-black text-white">Deactivate Agent Identity</p>
                <p className="text-xs text-red-500/60 font-medium">This action is irreversible and wipes all local hardware keys.</p>
            </div>
        </div>
        <button className="px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all">
            Initiate Purge
        </button>
      </motion.div>
    </div>
  );
};

const SettingToggle = ({ icon, title, description, active = false }: any) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-xl border transition-colors ${active ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-white/5 border-white/10 text-gray-500'}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold group-hover:text-blue-400 transition-colors">{title}</p>
        <p className="text-[10px] text-gray-500 leading-tight">{description}</p>
      </div>
    </div>
    <div className={`w-12 h-6 rounded-full relative flex items-center px-1 cursor-pointer transition-colors ${active ? 'bg-blue-600' : 'bg-white/10'}`}>
      <motion.div 
        animate={{ x: active ? 24 : 0 }}
        className="w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </div>
  </div>
);
