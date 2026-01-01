import React, { useState } from 'react';
import { X, CreditCard, Check, Zap, Sparkles, Star, Shield, TrendingUp } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '../stripe';
import { useAuth } from '../contexts/AuthContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<{ onSuccess: () => void; onClose: () => void }> = ({ onSuccess, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, upgradeToPro } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setError('');

    // Open Stripe Payment Link
    window.open('https://buy.stripe.com/test_aFaeVe1EvcH06hr7vBeEo00', '_blank');

    // Simulate success after opening link (in real app, handle webhook)
    // For demo, upgrade immediately
    if (user) {
      await upgradeToPro(user.uid);
    }

    setTimeout(() => {
      setLoading(false);
      onSuccess();
      onClose();
    }, 1000);
  };

  const features = [
    { icon: <Sparkles className="w-5 h-5" />, text: "Unbegrenzte KI-Analysen" },
    { icon: <Star className="w-5 h-5" />, text: "Premium-KI-Genauigkeit" },
    { icon: <Shield className="w-5 h-5" />, text: "Keine Wartezeiten" },
    { icon: <TrendingUp className="w-5 h-5" />, text: "Vorrangige Verarbeitung" }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Pro Account</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Unbegrenzte Scans & Premium-Features</p>
          </div>
        </div>
        <div className="text-2xl font-black text-blue-600">4,99 €<span className="text-sm font-normal text-slate-500">/Monat</span></div>
      </div>

      {/* Features List */}
      <div className="space-y-3">
        <h4 className="font-semibold text-slate-900 dark:text-white">Premium-Vorteile:</h4>
        <div className="grid gap-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className="text-blue-600 dark:text-blue-400">{feature.icon}</div>
              <span className="text-slate-700 dark:text-slate-300">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Kreditkarte
        </label>
        <div className="p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#374151',
                  '::placeholder': {
                    color: '#9CA3AF',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {error && (
        <div className="text-red-600 text-sm bg-red-50 dark:bg-red-900/30 p-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Jetzt für 4,99€/Monat buchen
          </>
        )}
      </button>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
        Sie können das Abonnement jederzeit kündigen. Keine versteckten Gebühren.
      </p>
    </form>
  );
};

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Upgrade auf Pro
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title="Schließen">
            <X className="w-6 h-6" />
          </button>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm onSuccess={onSuccess} onClose={onClose} />
        </Elements>
      </div>
    </div>
  );
};