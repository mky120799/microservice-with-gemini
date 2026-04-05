import React from 'react';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransferForm } from './components/TransferForm';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';

import { Analytics } from './components/Analytics';
import { Transactions } from './components/Transactions';
import { Security } from './components/Security';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [isSignup, setIsSignup] = React.useState(false);
  const [isForgotPassword, setIsForgotPassword] = React.useState(false);
  const [resetToken, setResetToken] = React.useState<string | null>(null);
  const [view, setView] = React.useState(() => localStorage.getItem('zenith_view') || 'dashboard');

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      setResetToken(token);
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem('zenith_view', view);
  }, [view]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center font-bold text-primary">Zenith Banking...</div>;

  if (!user) {
    if (resetToken) {
      return <ResetPassword onSuccess={() => {
        setResetToken(null);
        window.history.replaceState({}, document.title, "/");
      }} />;
    }

    if (isForgotPassword) {
      return <ForgotPassword onBack={() => setIsForgotPassword(false)} />;
    }

    return (
      <div className="flex flex-col">
        {isSignup ? <Signup /> : <Login onForgotPassword={() => setIsForgotPassword(true)} />}
        <button 
          onClick={() => setIsSignup(!isSignup)}
          className="text-primary hover:text-blue-400 absolute bottom-8 left-1/2 -translate-x-1/2 underline text-sm"
        >
          {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
      </div>
    );
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard />;
      case 'transfers':
        return <div className="max-w-2xl mx-auto"><TransferForm /></div>;
      case 'analytics':
        return <Analytics />;
      case 'transactions':
        return <Transactions />;
      case 'security':
        return <Security />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentView={view} setView={setView}>
      {renderView()}
    </Layout>
  );
};

export default App;
