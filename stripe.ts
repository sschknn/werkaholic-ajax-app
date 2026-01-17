import { loadStripe } from '@stripe/stripe-js';

// Stripe publishable key - wird aus Umgebungsvariablen geladen
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY 
  || process.env.VITE_STRIPE_PUBLISHABLE_KEY
  || 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY';

export const stripePromise = loadStripe(stripePublishableKey);

// Stripe Payment Link für Pro-Upgrade
export const STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/test_aFaeVe1EvcH06hr7vBeEo00';

// Pro-Plan Einstellungen
export const PRO_PLAN = {
  price: 4.99,
  currency: 'EUR',
  interval: 'month',
  name: 'Pro Account',
  description: 'Unbegrenzte Scans & Premium-Features'
};

// Für Entwicklung: Test-Keys von https://dashboard.stripe.com/test/apikeys
// Für Produktion: Verwende echte Keys von https://dashboard.stripe.com/apikeys
