import 'reflect-metadata';
import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import Stripe from 'stripe';
import axios from 'axios';
import { DataSource } from 'typeorm';
import { Payment, PaymentStatus } from './entities/Payment';

const app = express();
app.set('trust proxy', true);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  username: process.env.DB_USER || 'zenith_user',
  password: process.env.DB_PASSWORD || 'zenith_password',
  database: process.env.DB_NAME || 'zenith_bank',
  synchronize: true,
  logging: false,
  entities: [Payment],
});

// Initialize Database
AppDataSource.initialize()
  .then(() => console.log('✅ Payment Service DB Initialized'))
  .catch((err) => console.error('❌ Error during Payment Service DB Initialization', err));

// Intent Creation
app.post('/api/payments/create-intent', json(), async (req, res) => {
  const { amount, currency = 'usd' } = req.body;
  const userId = req.headers['x-user-id'] as string;

  console.log(`💳 Creating Intent - User: ${userId}, Amount: ${amount}`);

  if (!amount || !userId) {
    return res.status(400).send({ error: 'Amount and User ID are required' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: { userId },
    });

    // Persist Payment as PENDING
    const paymentRepository = AppDataSource.getRepository(Payment);
    const payment = paymentRepository.create({
      amount,
      userId,
      stripeId: paymentIntent.id,
      status: PaymentStatus.PENDING,
    });
    await paymentRepository.save(payment);

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    res.status(400).send({ error: err.message });
  }
});

// Production Webhook handler with Signature Verification & Idempotency
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error(`❌ Webhook Signature Verification Failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const paymentRepository = AppDataSource.getRepository(Payment);

    // Idempotency: Find the payment record
    const payment = await paymentRepository.findOne({ where: { stripeId: paymentIntent.id } });

    if (!payment) {
      console.error(`❌ Payment record not found for Stripe ID: ${paymentIntent.id}`);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Check if already completed to prevent double-crediting
    if (payment.status === PaymentStatus.COMPLETED) {
      console.log(`ℹ️ Payment ${paymentIntent.id} already processed.`);
      return res.json({ received: true });
    }

    // Update status and sync with ledger
    try {
      console.log(`💰 Processing fulfillment for user ${payment.userId}: $${payment.amount}`);
      
      await axios.post(`${process.env.LEDGER_SERVICE_URL}/api/ledger/topup`, {
        userId: payment.userId,
        amount: payment.amount,
        reference: payment.stripeId,
      });

      payment.status = PaymentStatus.COMPLETED;
      await paymentRepository.save(payment);
      
      console.log(`✅ Payment ${paymentIntent.id} completed successfully.`);
    } catch (err) {
      console.error('❌ Failed to update ledger or save status:', err);
      // We don't return an error here to Stripe because we want to retry if needed? 
      // Actually, Stripe will retry if we return 4xx/5xx.
      return res.status(500).json({ error: 'Fulfillment failed' });
    }
  }

  res.json({ received: true });
});

const PORT = 3006;
app.listen(PORT, () => {
  console.log(`🚀 Payment service running on port ${PORT}`);
});
