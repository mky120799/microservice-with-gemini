import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Settings, Check, X, ShieldCheck, PieChart, Activity, Megaphone } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('zenith_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    saveConsent(allAccepted);
  };

  const handleAcceptEssentials = () => {
    const essentialsOnly = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    saveConsent(essentialsOnly);
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem('zenith_cookie_consent', JSON.stringify(prefs));
    setShowBanner(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 200, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-6 left-6 right-6 lg:left-auto lg:right-12 lg:w-[480px] z-[9999]"
        >
          <div className="glass p-8 rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
              <Shield size={180} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-500/10 rounded-2xl">
                  <ShieldCheck size={28} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight text-white">Trust & Transparency</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cookie Management Protocol</p>
                </div>
              </div>

              {!showCustom ? (
                <>
                  <p className="text-sm text-gray-400 leading-relaxed mb-8 font-medium">
                    We use strategic tracking to enhance your institutional experience. Our data protocol ensures your privacy while optimizing our financial terminal's performance.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={handleAcceptAll}
                      className="btn-primary py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Check size={16} strokeWidth={3} /> Accept All
                    </button>
                    <button
                      onClick={() => setShowCustom(true)}
                      className="glass-hover py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white flex items-center justify-center gap-2"
                    >
                      <Settings size={16} /> Customize
                    </button>
                    <button
                      onClick={handleAcceptEssentials}
                      className="sm:col-span-2 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-gray-400 transition-colors text-center mt-2"
                    >
                      Decline Non-Essentials
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3 mb-8">
                    <PreferenceItem 
                      icon={<Activity size={16} />}
                      label="Essential" 
                      description="Required for system stability and core banking auth."
                      checked={preferences.essential}
                      disabled
                      onChange={() => {}} 
                    />
                    <PreferenceItem 
                      icon={<Settings size={16} />}
                      label="Functional" 
                      description="Theme persistence and custom workspace configurations."
                      checked={preferences.functional}
                      onChange={() => togglePreference('functional')} 
                    />
                    <PreferenceItem 
                       icon={<PieChart size={16} />}
                       label="Analytics" 
                       description="Helps us optimize the portal's high-frequency performance."
                       checked={preferences.analytics}
                       onChange={() => togglePreference('analytics')} 
                    />
                    <PreferenceItem 
                       icon={<Megaphone size={16} />}
                       label="Marketing" 
                       description="Relevant institutional announcements and portfolio insights."
                       checked={preferences.marketing}
                       onChange={() => togglePreference('marketing')} 
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowCustom(false)}
                      className="flex-1 glass-hover py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-400"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSaveCustom}
                      className="flex-2 btn-primary py-4 px-8 rounded-2xl text-xs font-black uppercase tracking-widest"
                    >
                      Finalize My Choices
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface PreferenceItemProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
}

const PreferenceItem: React.FC<PreferenceItemProps> = ({ icon, label, description, checked, disabled, onChange }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/[0.05] group">
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-lg ${checked ? 'bg-primary/20 text-primary' : 'bg-gray-800 text-gray-500'}`}>
        {icon}
      </div>
      <div>
        <p className={`text-xs font-black uppercase tracking-tight ${disabled ? 'opacity-50' : ''}`}>{label}</p>
        <p className="text-[10px] text-gray-600 font-medium leading-tight max-w-[200px]">{description}</p>
      </div>
    </div>
    
    <button
      disabled={disabled}
      onClick={onChange}
      className={`w-10 h-6 rounded-full relative transition-all duration-300 ${checked ? 'bg-primary shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-gray-800 opacity-50'}`}
    >
      <motion.div
        animate={{ x: checked ? 18 : 4 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  </div>
);
