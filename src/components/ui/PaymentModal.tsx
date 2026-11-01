import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';
import { cn } from '../utils/cn';
import { loadStripe } from '@stripe/stripe-js';
import { CardElement } from '@stripe/react-stripe-js';

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  analysis: any;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  analysis,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  const cardElementRef = useRef<CardElement | null>(null);

  useEffect(() => {
    // Stripe.js is loaded on demand via loadStripe hook
  }, [import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY]);

  if (!isOpen) {
    return null;
  }

  const handlePayment = async (event: React.MouseEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!cardElementRef.current) {
      setError('Card element not initialized');
      setLoading(false);
      return;
    }

    try {
      // Create a PaymentIntent on the backend
      const amountValue =
        analysis.price_estimate?.replace('€', '').replace(',', '.') || '0';
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(Number(amountValue) * 100),
          currency: 'eur',
        }),
      });

      const data = await response.json();

      if (!data.clientSecret) {
        setError('Failed to create payment intent');
        setLoading(false);
        return;
      }

      // Initialize Stripe with the payment intent
      const stripe = await stripePromise;

      // Confirm the payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElementRef.current,
        },
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed');
        setLoading(false);
      } else if (result.paymentStatus === 'succeeded') {
        setLoading(false);
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl p-8 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-white mb-6">Zahlung</h2>

        {error && (
          <div className="bg-red-500 text-white p-4 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        <p className="text-slate-400 mb-6">
          Inserat: {analysis.title}
        </p>

        <p className="text-slate-400 mb-6">
          Geschätzter Wert: {analysis.price_estimate}
        </p>

        <CardElement
          ref={cardElementRef}
          options={{
            style: {
              base: {
                color: '#fff',
                fontWeight: '500',
                fontFamily: 'Inter, sans-serif',
                fontSize: '18px',
                '::placeholder': {
                  color: '#888',
                },
              },
            },
          }}
        />

        <button
          onClick={handlePayment}
          disabled={loading}
          className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {loading
            ? 'Bezahling läuft...'
            : 'Jetzt bezahlen und Inserat veröffentlichen'}
        </button>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-slate-600 hover:bg-slate-500 text-white py-3 rounded-xl font-bold mt-4">
          Abbrechen
        </button>
      </div>
    </div>
  );
};