import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Smartphone, Fingerprint, Eye, EyeOff, QrCode, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export const Security: React.FC = () => {
  // 2FA state
  const { setup2FA, enable2FA, user } = useAuth();
  const [twoFAStep, setTwoFAStep] = useState<'idle' | 'qr' | 'verify' | 'done'>('idle');
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [secret, setSecret] = useState('');
  const [totpToken, setTotpToken] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAError, setTwoFAError] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');

  const handleSetup2FA = async () => {
    setTwoFALoading(true);
    setTwoFAError('');
    try {
      const data = await setup2FA();
      setQrCodeDataURL(data.qrCodeDataURL);
      setSecret(data.secret);
      setTwoFAStep('qr');
    } catch (err: any) {
      setTwoFAError('Failed to generate QR Code. Make sure you are signed in.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFALoading(true);
    setTwoFAError('');
    try {
      await enable2FA(totpToken);
      setTwoFAStep('done');
    } catch (err: any) {
      setTwoFAError(err?.response?.data?.errors?.[0]?.message || 'Invalid token. Please try again.');
    } finally {
      setTwoFALoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg('');
    setPwLoading(true);
    try {
      await api.post('/api/users/change-password', { currentPassword, newPassword });
      setPwMsg('✅ Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPwMsg(err?.response?.data?.errors?.[0]?.message || '❌ Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* ── Password Management ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass p-8 rounded-[2.5rem] space-y-6"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <Lock size={24} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Access Control</h3>
              <p className="text-xs text-gray-500 font-medium">Secure your portal</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            {/* Current password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Current Password</label>
              <div className="relative group">
                <input
                  id="current-password"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm pr-14"
                  placeholder="••••••••••••"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showCurrent ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">New Secure Key</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-sm pr-14"
                  placeholder="At least 4 characters"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
                  {showNew ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {pwMsg && <p className={`text-xs ${pwMsg.startsWith('✅') ? 'text-green-400' : 'text-red-400'}`}>{pwMsg}</p>}

            <button
              id="update-password-btn"
              type="submit"
              disabled={pwLoading}
              className="w-full btn-primary py-4 rounded-2xl text-xs font-black uppercase tracking-widest mt-4 disabled:opacity-50"
            >
              {pwLoading ? 'Updating…' : 'Update Credentials'}
            </button>
          </form>
        </motion.div>

        {/* ── Two-Factor Auth ── */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-[2.5rem] space-y-6"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-violet-500/10 rounded-2xl">
              <Smartphone size={24} className="text-violet-400" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Two-Factor Auth</h3>
              <p className="text-xs text-gray-500 font-medium">Extra layer of defense</p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Idle — show Setup button */}
            {twoFAStep === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/10 text-center">
                  <QrCode size={40} className="text-violet-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-white">Authenticator App (TOTP)</p>
                  <p className="text-xs text-gray-400 mt-1">Works with Google Authenticator, Authy, 1Password, and more.</p>
                </div>
                {twoFAError && <p className="text-red-400 text-xs text-center">{twoFAError}</p>}
                <button
                  id="setup-2fa-btn"
                  onClick={handleSetup2FA}
                  disabled={twoFALoading}
                  className="w-full btn-primary py-4 rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-50"
                >
                  {twoFALoading ? 'Generating…' : 'Set Up 2FA'}
                </button>
              </motion.div>
            )}

            {/* QR Code step */}
            {twoFAStep === 'qr' && (
              <motion.div key="qr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <p className="text-xs text-gray-400 text-center">Scan this QR code with your authenticator app, then click <strong>Next</strong> to confirm.</p>
                <div className="flex justify-center">
                  <div className="p-3 bg-white rounded-2xl">
                    <img src={qrCodeDataURL} alt="2FA QR Code" className="w-44 h-44 rounded-lg" />
                  </div>
                </div>
                <div className="p-3 bg-black/30 rounded-2xl border border-white/10 text-center">
                  <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-widest font-bold">Manual Entry Key</p>
                  <p className="font-mono text-xs text-violet-300 break-all">{secret}</p>
                </div>
                <button id="qr-next-btn" onClick={() => setTwoFAStep('verify')} className="w-full btn-primary py-4 rounded-2xl text-xs font-black uppercase tracking-widest">
                  Next — Verify Token
                </button>
              </motion.div>
            )}

            {/* Verify token step */}
            {twoFAStep === 'verify' && (
              <motion.form key="verify" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleVerify2FA} className="space-y-4">
                <p className="text-xs text-gray-400 text-center">Enter the 6-digit code shown in your authenticator app to confirm setup.</p>
                <input
                  id="totp-verify-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-violet-500/50 focus:bg-white/10 transition-all font-mono text-2xl tracking-[0.5em] text-center text-white"
                  placeholder="000000"
                  required
                  autoFocus
                />
                {twoFAError && <p className="text-red-400 text-xs text-center">{twoFAError}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setTwoFAStep('qr')} className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-all">
                    Back
                  </button>
                  <button
                    id="confirm-2fa-btn"
                    type="submit"
                    disabled={twoFALoading || totpToken.length < 6}
                    className="flex-1 btn-primary py-4 rounded-2xl text-xs font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    {twoFALoading ? 'Verifying…' : 'Confirm & Enable'}
                  </button>
                </div>
              </motion.form>
            )}

            {/* Done */}
            {twoFAStep === 'done' && (
              <motion.div key="done" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-green-500/10 rounded-full">
                  <CheckCircle2 size={48} className="text-green-400" />
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-white">2FA Enabled!</p>
                  <p className="text-xs text-gray-400 mt-1">Your account is now protected with two-factor authentication.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Active Sessions ── */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass p-8 rounded-[2.5rem]"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-2xl">
              <Eye size={24} className="text-red-400" />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Active Sessions</h3>
              <p className="text-xs text-gray-500 font-medium">Log of active hardware portals</p>
            </div>
          </div>
          <button className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-white transition-colors">
            End All
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/5 rounded-2xl text-blue-400">
                <Smartphone size={24} />
              </div>
              <div>
                <p className="text-base font-black text-white">Current Device • Browser</p>
                <p className="text-[11px] text-gray-500 font-bold mt-0.5 uppercase tracking-wider">
                  {user?.email} • Current Session
                </p>
              </div>
            </div>
            <div className="px-3 py-1 bg-green-500/10 rounded-lg">
              <p className="text-[10px] font-black text-green-500 uppercase">Active</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
