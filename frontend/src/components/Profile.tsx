import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserIcon, Mail, ShieldCheck, Calendar, Trophy, Zap, CreditCard, ChevronRight, Edit3, Check, X, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PREDEFINED_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
];

export const Profile: React.FC = () => {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ name, avatarUrl });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    try {
      const url = await uploadAvatar(file);
      setAvatarUrl(url);
    } catch (err) {
      console.error('Avatar upload failed', err);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Hero Profile Section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass p-10 rounded-[3rem] relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-10">
            <UserIcon size={200} className="text-blue-500" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative group">
            <div className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-600 via-violet-600 to-indigo-600 p-1 shadow-2xl shadow-blue-500/20">
              <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-5xl font-black text-blue-400 border border-white/10 ring-4 ring-white/5 overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-crop" />
                ) : (
                  user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()
                )}
              </div>
            </div>
            <label className={`absolute inset-0 flex items-center justify-center bg-black/40 rounded-full transition-opacity cursor-pointer ${uploadLoading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
              <div className="flex flex-col items-center gap-2">
                {uploadLoading ? (
                  <>
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase text-white/70">Syncing...</span>
                  </>
                ) : (
                  <>
                    <Camera size={32} className="text-white/80" />
                    <span className="text-[10px] font-black uppercase text-white/70">Change Photo</span>
                  </>
                )}
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadLoading} />
            </label>
          </div>
          
          <div className="text-center md:text-left space-y-4 flex-1">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div 
                  key="edit"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Display Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full max-w-xs bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-2xl font-black tracking-tighter text-blue-400 focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">Choose Avatar</label>
                    <div className="flex gap-3">
                      {PREDEFINED_AVATARS.map((url, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setAvatarUrl(url)}
                          className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${avatarUrl === url ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/20' : 'border-white/10 hover:border-white/30'}`}
                        >
                          <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                      <button 
                         onClick={() => setAvatarUrl('')}
                         className={`w-10 h-10 rounded-xl bg-white/5 border-2 flex items-center justify-center transition-all ${!avatarUrl ? 'border-blue-500' : 'border-white/10'}`}
                      >
                        <UserIcon size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : <><Check size={16} /> Save Changes</>}
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                    >
                      <X size={16} /> Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="view"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                    <h2 className="text-4xl font-black tracking-tighter text-gradient">
                      {user.name || user.email.split('@')[0]}
                    </h2>
                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[10px] font-black text-blue-400 uppercase tracking-widest">
                      {user.role || 'Guest'} Agent
                    </span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-4 text-gray-500 font-bold text-sm tracking-tight capitalize">
                    <p className="flex items-center gap-1.5"><Mail size={16} /> {user.email}</p>
                    <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                    <p className="flex items-center gap-1.5"><Calendar size={16} /> Joined March 2026</p>
                  </div>
                  <div className="pt-6">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-xs font-black uppercase tracking-widest group"
                    >
                      <Edit3 size={16} className="group-hover:rotate-12 transition-transform" />
                      Edit Profile
                    </button>
                    <label className="flex items-center gap-2 px-6 py-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest text-blue-400 cursor-pointer">
                      <Camera size={16} />
                      {uploadLoading ? 'Syncing...' : 'Upload New Photo'}
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploadLoading} />
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
