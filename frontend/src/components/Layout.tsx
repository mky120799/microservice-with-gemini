import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, Send, Bell, PieChart, Shield, History, User, Settings, MessageSquare, Activity, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../hooks/useSocket';
import { CookieConsent } from './CookieConsent';

export const Layout: React.FC<{ 
  children: React.ReactNode, 
  currentView: string,
  setView: (view: string) => void 
}> = ({ children, currentView, setView }) => {
  const { user, logout } = useAuth();
  const { notifications, clearNotifications } = useSocket();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isEmployee = user?.role === 'admin' || user?.role === 'auditor' || user?.role === 'finance' || user?.role === 'employee';

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'auditor': return 'Audit Officer';
      case 'finance': return 'Finance Manager';
      default: return 'Gold Member';
    }
  };
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row overflow-hidden">
      <div className="mesh-bg" />
      
      {/* Desktop Sidebar - Hidden on Mobile */}
      <aside className="hidden lg:flex w-72 border-r border-white/5 p-8 space-y-10 flex-col relative z-20 glass m-4 rounded-3xl h-[calc(100vh-2rem)] overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-4 px-2">
          <motion.div 
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
            className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20"
          >
            Z
          </motion.div>
          <span className="text-2xl font-bold tracking-tight text-gradient">Zenith</span>
        </div>

        <nav className="flex-1 space-y-3">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => setView('dashboard')}
          />
          <NavItem 
            icon={<Send size={20} />} 
            label="Transfers" 
            active={currentView === 'transfers'} 
            onClick={() => setView('transfers')}
          />
          <NavItem 
            icon={<History size={20} />} 
            label="Transactions" 
            active={currentView === 'transactions'} 
            onClick={() => setView('transactions')}
          />
          <NavItem 
            icon={<PieChart size={20} />} 
            label="Analytics" 
            active={currentView === 'analytics'} 
            onClick={() => setView('analytics')}
          />
          {isEmployee && (
            <>
              <NavItem 
                icon={<Shield size={20} />} 
                label="Security" 
                active={currentView === 'security'} 
                onClick={() => setView('security')}
              />
              <NavItem 
                icon={<MessageSquare size={20} />} 
                label="Support" 
                active={currentView === 'support'} 
                onClick={() => setView('support')}
              />
              <NavItem 
                icon={<Activity size={20} />} 
                label="System Status" 
                active={currentView === 'system'} 
                onClick={() => setView('system')} 
              />
              {user?.role === 'admin' && (
                <NavItem 
                  icon={<Users size={20} />} 
                  label="Users" 
                  active={currentView === 'users'} 
                  onClick={() => setView('users')} 
                />
              )}
            </>
          )}
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <div className="px-4 py-3 rounded-2xl bg-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center font-bold text-blue-400 border border-white/10 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user.name || user.email.split('@')[0]}</p>
              <p className="text-xs text-gray-500 truncate lowercase">{getRoleLabel(user.role)}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 p-4 rounded-2xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative z-10 transition-all duration-500">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-6 glass m-4 rounded-2xl mb-2 relative z-50">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-violet-600 rounded-lg flex items-center justify-center font-bold text-white text-xs">Z</div>
                <h1 className="text-lg font-black tracking-tighter uppercase">{currentView}</h1>
            </div>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={`w-10 h-10 rounded-full glass flex items-center justify-center relative transition-colors ${notifications.length > 0 ? 'text-blue-400' : 'text-gray-500'}`}
                >
                    <Bell size={18} />
                    {notifications.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
                </button>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center text-[10px] font-bold text-blue-400 border border-white/10 overflow-hidden"
                >
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()
                    )}
                </button>
            </div>
            
            <AnimatePresence>
                {isNotificationsOpen && (
                    <div ref={notificationRef}>
                        <NotificationDropdown 
                        notifications={notifications} 
                        onClear={clearNotifications} 
                        onClose={() => setIsNotificationsOpen(false)} 
                        />
                    </div>
                )}
                 {isProfileOpen && (
                    <div ref={profileRef}>
                        <ProfileDropdown 
                        user={user} 
                        getRoleLabel={getRoleLabel}
                        onLogout={logout} 
                        onSelect={(v: string) => { setView(v); setIsProfileOpen(false); }} 
                        onClose={() => setIsProfileOpen(false)}
                        />
                    </div>
                )}
            </AnimatePresence>
        </header>

        {/* Dynamic Content Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 custom-scrollbar pb-24 lg:pb-12">
          {/* Desktop Only Header */}
          <header className="hidden lg:flex justify-between items-center mb-12 relative z-50">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-4xl font-black tracking-tighter mb-1 uppercase">
                {currentView === 'dashboard' ? 'Portfolio Overview' : currentView}
              </h1>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest italic opacity-60">Zenith Institutional Banking Terminal v4.0</p>
            </motion.div>
            
            <div className="flex items-center gap-4 relative">
                <button 
                  onClick={() => { setIsNotificationsOpen(!isNotificationsOpen); setIsProfileOpen(false); }}
                  className="glass p-3 rounded-xl text-gray-400 hover:text-white transition-colors relative"
                >
                  <Bell size={20} />
                  {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                </button>
                <button 
                  onClick={() => { setIsProfileOpen(!isProfileOpen); setIsNotificationsOpen(false); }}
                  className="glass w-11 h-11 rounded-xl text-gray-400 hover:text-white transition-colors overflow-hidden flex items-center justify-center"
                >
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} />
                  )}
                </button>

                <AnimatePresence>
                    {isNotificationsOpen && (
                        <div ref={notificationRef}>
                            <NotificationDropdown 
                            notifications={notifications} 
                            onClear={clearNotifications} 
                            onClose={() => setIsNotificationsOpen(false)} 
                            desktop 
                            />
                        </div>
                    )}
                     {isProfileOpen && (
                        <div ref={profileRef}>
                            <ProfileDropdown 
                            user={user} 
                            getRoleLabel={getRoleLabel}
                            onLogout={logout} 
                            onSelect={(v: string) => { setView(v); setIsProfileOpen(false); }} 
                            onClose={() => setIsProfileOpen(false)}
                            desktop
                            />
                        </div>
                    )}
                </AnimatePresence>
            </div>
          </header>
          
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass m-4 rounded-3xl p-2 z-50 flex items-center justify-around translate-y-0 shadow-2xl shadow-black/50 border-t border-white/10">
          <MobileNavItem 
            icon={<LayoutDashboard size={20} />} 
            active={currentView === 'dashboard'} 
            onClick={() => setView('dashboard')}
          />
          <MobileNavItem 
            icon={<Send size={20} />} 
            active={currentView === 'transfers'} 
            onClick={() => setView('transfers')}
          />
          <MobileNavItem 
            icon={<History size={20} />} 
            active={currentView === 'transactions'} 
            onClick={() => setView('transactions')}
          />
           <MobileNavItem 
            icon={<PieChart size={20} />} 
            active={currentView === 'analytics'} 
            onClick={() => setView('analytics')}
          />
          {isEmployee && (
            <>
              <MobileNavItem 
                icon={<Shield size={20} />} 
                active={currentView === 'security'} 
                onClick={() => setView('security')}
              />
              <MobileNavItem 
                icon={<MessageSquare size={20} />} 
                active={currentView === 'support'} 
                onClick={() => setView('support')}
              />
              <MobileNavItem 
                icon={<Activity size={20} />} 
                active={currentView === 'system'} 
                onClick={() => setView('system')}
              />
              {user?.role === 'admin' && (
                <MobileNavItem 
                  icon={<Users size={20} />} 
                  active={currentView === 'users'} 
                  onClick={() => setView('users')} 
                />
              )}
            </>
          )}
      </nav>
      <CookieConsent />
    </div>
  );
};

const NotificationDropdown = ({ notifications, onClear, onClose, desktop = false }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.95 }}
    className={`absolute right-0 mt-2 w-[320px] glass p-6 rounded-[2rem] z-50 shadow-2xl border-white/10 ${desktop ? 'top-full' : 'top-16 shadow-black/80'}`}
  >
    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
      <h4 className="text-sm font-black uppercase tracking-widest">Notifications</h4>
      <button 
        onClick={(e) => { e.stopPropagation(); onClear(); onClose(); }}
        className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-colors"
      >
        Clear List
      </button>
    </div>
    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
      {notifications.length === 0 ? (
        <div className="text-center py-8 opacity-20 italic text-xs">No active signals</div>
      ) : (
        notifications.map((n: any, i: number) => (
          <div key={i} className="flex gap-4 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            <p className="text-[11px] leading-relaxed text-gray-300">{n.message}</p>
          </div>
        ))
      )}
    </div>
  </motion.div>
);

 const ProfileDropdown = ({ user, onLogout, onSelect, onClose, getRoleLabel, desktop = false }: any) => {
    const handleSelect = (v: string) => {
        onSelect(v);
        onClose();
    };

    const isEmployee = user?.role === 'admin' || user?.role === 'auditor' || user?.role === 'finance';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`absolute right-0 mt-2 w-[240px] glass p-4 rounded-[2rem] z-50 shadow-2xl border-white/10 ${desktop ? 'top-full' : 'top-16 shadow-black/80'}`}
        >
            <div className="px-4 py-3 mb-3 border-b border-white/5">
                <p className="text-xs font-black text-gradient truncate mb-0.5">{user?.email}</p>
                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{getRoleLabel(user?.role)}</p>
            </div>
            <div className="space-y-1">
                <ProfileItem icon={<User size={16} />} label="My Profile" onClick={() => handleSelect('profile')} />
                {isEmployee && <ProfileItem icon={<Shield size={16} />} label="Security" onClick={() => handleSelect('security')} />}
                <ProfileItem icon={<Settings size={16} />} label="Settings" onClick={() => handleSelect('settings')} />
                <div className="h-px bg-white/5 my-2 mx-2" />
                <ProfileItem icon={<LogOut size={16} />} label="Deactivate" onClick={onLogout} danger />
            </div>
        </motion.div>
    );
};

const ProfileItem = ({ icon, label, onClick, danger = false }: any) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${danger ? 'text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
  >
    {icon}
    <span className="text-xs font-bold">{label}</span>
  </button>
);

const NavItem = ({ icon, label, active = false, onClick }: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean,
  onClick: () => void 
}) => (
  <motion.button 
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    whileHover={{ x: 5 }}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 font-bold tracking-wide ${
      active 
      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5' 
      : 'text-gray-500 hover:bg-white/5 hover:text-gray-200'
    }`}
  >
    <div className={`${active ? 'text-blue-400' : 'text-gray-500'} transition-colors`}>
      {icon}
    </div>
    {label}
  </motion.button>
);

const MobileNavItem = ({ icon, active = false, onClick }: { 
  icon: React.ReactNode, 
  active?: boolean,
  onClick: () => void 
}) => (
  <motion.button 
    onClick={onClick}
    whileTap={{ scale: 0.9 }}
    className={`p-4 rounded-2xl transition-all duration-300 ${
      active 
      ? 'bg-blue-600/20 text-blue-400 shadow-lg shadow-blue-500/10' 
      : 'text-gray-500 hover:text-gray-300'
    }`}
  >
    {icon}
  </motion.button>
);
