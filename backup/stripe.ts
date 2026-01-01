import { loadStripe } from '@stripe/stripe-js';

// Replace with your Stripe publishable key
const stripePublishableKey = 'pk_test_YOUR_STRIPE_PUBLISHABLE_KEY';

export const stripePromise = loadStripe(stripePublishableKey);

// For development, you can use test keys
// Get your keys from https://dashboard.stripe.com/test/apikeys