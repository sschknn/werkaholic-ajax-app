const express = require('express');
const stripe = require('stripe')('sk_test_YOUR_STRIPE_SECRET_KEY', {
  apiVersion: '2024-09-30',
});
const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Create PaymentIntent
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for payment completion (optional but recommended)
app.post('/api/webhook/stripe', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhook.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log('⚠️ Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    // TODO: Update user subscription in Firestore
    console.log(`💰 Payment received! PaymentIntent ID: ${paymentIntent.id}`);
  }

  res.json({ received: true });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;