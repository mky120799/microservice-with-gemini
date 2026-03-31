import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Shield } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const CheckoutForm: React.FC<{ amount: number; onSuccess: () => void }> = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    console.log('💳 Initiating payment confirmation...');
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
      redirect: 'if_required',
    });

    if (error) {
      console.error('❌ Stripe Confirmation Error:', error);
      setErrorMessage(error.message || 'An unexpected error occurred.');
      setLoading(false);
    } else {
      console.log('✅ Payment successful, triggering success callback');
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement className="stripe-element" />
      <button
        disabled={!stripe || loading}
        className="btn-primary w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
      >
        {loading ? 'Processing...' : `Pay $${amount}`}
      </button>
      {errorMessage && <div className="text-red-400 text-sm font-bold text-center mt-4 bg-red-400/10 p-4 rounded-xl">{errorMessage}</div>}
    </form>
  );
};

interface TopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TopUp: React.FC<TopUpProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>('50');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartPayment = async () => {
    setError(null);
    try {
      const res = await api.post('/api/payments/create-intent', {
        amount: parseFloat(amount),
      }, {
        headers: { 'x-user-id': user?.id }
      });
      setClientSecret(res.data.clientSecret);
    } catch (err: any) {
      console.error('Failed to create payment intent');
      setError(err.response?.data?.error || 'Failed to start payment process.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass p-10 rounded-[2.5rem] z-[101] max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <CreditCard size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Top Up Wallet</h3>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                    <Shield size={10} className="text-green-500" />
                    Secure Transaction
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            {!clientSecret ? (
              <div className="space-y-8">
                <div>
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3 block">Enter Amount ($)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-3xl font-bold focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                {error && <div className="text-red-400 text-sm font-bold bg-red-400/10 p-4 rounded-xl">{error}</div>}
                <div className="grid grid-cols-3 gap-3">
                  {['10', '50', '100'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setAmount(val)}
                      className={`py-3 rounded-xl font-bold text-sm transition-all ${
                        amount === val ? 'bg-primary text-white' : 'bg-white/5 hover:bg-white/10 text-gray-400'
                      }`}
                    >
                      ${val}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleStartPayment}
                  className="btn-primary w-full py-4 rounded-2xl font-bold"
                >
                  Continue to Payment
                </button>
              </div>
            ) : (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm amount={parseFloat(amount)} onSuccess={onSuccess} />
              </Elements>
            )}
            
            <p className="text-center text-[10px] text-gray-500 mt-8 font-medium">
              Payments are handled securely by Stripe. We do not store your card details.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
