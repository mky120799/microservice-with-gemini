import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  User as UserIcon, 
  Mail, 
  Calendar,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Search,
  Key
} from 'lucide-react';

interface SystemUser {
  id: number;
  email: string;
  role: string;
  name?: string;
  avatarUrl?: string;
  createdAt: string;
}

export const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: '', type: null });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateRole = async (targetUserId: number, newRole: string) => {
    setUpdatingId(targetUserId);
    try {
      await api.patch(`/api/users/${targetUserId}/role`, { role: newRole });
      setStatusMsg({ msg: `Role updated to ${newRole} for User #${targetUserId}`, type: 'success' });
      fetchUsers();
      setTimeout(() => setStatusMsg({ msg: '', type: null }), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0]?.message || 'Failed to update role';
      setStatusMsg({ msg, type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const emailMatch = u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const nameMatch = u.name ? u.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
    return emailMatch || nameMatch;
  });

  const roles = ['admin', 'user', 'auditor', 'finance', 'employee'];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Key size={14} className="text-red-400" />;
      case 'employee': return <Briefcase size={14} className="text-blue-400" />;
      case 'auditor': return <Shield size={14} className="text-violet-400" />;
      case 'finance': return <Shield size={14} className="text-green-400" />;
      default: return <UserIcon size={14} className="text-gray-400" />;
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] opacity-30">
        <AlertCircle size={64} className="mb-6" />
        <h2 className="text-2xl font-black uppercase tracking-widest text-red-500">Access Restricted</h2>
        <p className="mt-2 font-bold">Only administrators can manage system permissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <Users className="text-primary w-10 h-10" />
            Registry Control
          </h1>
          <p className="text-gray-500 font-medium mt-1">Institutional User & Role Governance</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text"
            placeholder="Search by identity or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-primary/50 transition-all font-bold text-sm"
          />
        </div>
      </div>

      {statusMsg.msg && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center gap-3 font-bold ${statusMsg.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {statusMsg.msg}
        </motion.div>
      )}

      {/* Users Table */}
      <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Identity</th>
                <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Contact</th>
                <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Role Status</th>
                <th className="text-left p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Member Since</th>
                <th className="text-right p-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Governance</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u, i) => (
                <motion.tr 
                  key={u.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group hover:bg-white/[0.02] transition-all border-b border-white/5 last:border-0"
                >
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gray-800 to-gray-900 border border-white/10 overflow-hidden flex items-center justify-center font-black text-primary">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          u.name ? u.name[0].toUpperCase() : u.email[0].toUpperCase()
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white mb-0.5">{u.name || 'Anonymous User'}</p>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">ID #{u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-gray-400 group-hover:text-white transition-colors">
                      <Mail size={14} className="opacity-40" />
                      <span className="text-sm font-medium">{u.email}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2">
                       <div className="p-1.5 rounded-lg bg-white/5">
                          {getRoleIcon(u.role)}
                       </div>
                       <span className={`text-[10px] font-black uppercase tracking-widest ${
                         u.role === 'admin' ? 'text-red-400' : 
                         u.role === 'employee' ? 'text-blue-400' : 'text-gray-400'
                       }`}>
                         {u.role === 'user' ? 'Customer' : u.role}
                       </span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Calendar size={14} />
                      <span className="text-xs font-bold">{new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="p-6 text-right">
                    {u.id !== currentUser?.id ? (
                      <div className="relative inline-block text-left">
                        <select 
                          value={u.role}
                          disabled={updatingId === u.id}
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          className="appearance-none bg-[#0a0a0c] border border-white/10 rounded-xl px-4 py-2 pr-10 text-xs font-black uppercase tracking-widest text-gray-400 focus:outline-none focus:border-primary/50 cursor-pointer disabled:opacity-50 transition-all hover:bg-white/5"
                        >
                          {roles.map(r => (
                            <option key={r} value={r}>{r === 'user' ? 'Customer' : r}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none" size={14} />
                      </div>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-blue-500 tracking-widest opacity-40 italic pr-2">Current Admin</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {loading && (
          <div className="p-20 text-center text-gray-500 font-bold italic animate-pulse">
            Querying Registry Data...
          </div>
        )}
        
        {!loading && filteredUsers.length === 0 && (
          <div className="p-20 text-center opacity-30">
            <Users size={48} className="mx-auto mb-4" />
            <p className="font-bold uppercase tracking-widest">No matching agents found</p>
          </div>
        )}
      </div>
    </div>
  );
};
