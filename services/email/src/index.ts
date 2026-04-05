import express from 'express';
import amqp from 'amqplib';
import axios from 'axios';
import nodemailer from 'nodemailer';

const app = express();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const IDENTITY_SERVICE_URL = process.env.IDENTITY_SERVICE_URL || 'http://localhost:3000';

async function sendEmail(to: string, subject: string, text: string) {
  const isProduction = !!process.env.SMTP_USER;
  let transporter;

  if (isProduction) {
    console.log('🚀 Email Service: Using production SMTP (%s)', process.env.SMTP_HOST);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    console.log('🧪 Email Service: Using development Ethereal SMTP');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  try {
    const info = await transporter.sendMail({
      from: `"Zenith Banking" <${process.env.SMTP_USER || 'no-reply@zenith.com'}>`,
      to,
      subject,
      text,
    });

    console.log('✅ Email Service: Email successfully sent to:', to);
    if (!isProduction) {
      console.log('🔗 Email Service: Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('❌ Email Service: CRITICAL SEND ERROR:', (error as Error).message);
    throw error;
  }
}

async function start() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  const exchange = 'transaction-completed-exchange';
  const queue = 'email.transaction-completed';

  await channel.assertExchange(exchange, 'fanout', { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, '');

  console.log('🚀 Email Service: Waiting for messages in %s bound to %s', queue, exchange);

  // Password Reset Consumer
  const resetExchange = 'password-reset-requested';
  const resetQueue = 'email.password-reset';
  await channel.assertExchange(resetExchange, 'fanout', { durable: true });
  await channel.assertQueue(resetQueue, { durable: true });
  await channel.bindQueue(resetQueue, resetExchange, '');

  channel.consume(resetQueue, async (msg) => {
    if (msg !== null) {
      const payload = JSON.parse(msg.content.toString());
      const { email, token } = payload.data;

      console.log('📬 Email Service: Sending password reset to:', email);

      const subject = 'Reset Your Password - Zenith Banking';
      const resetUrl = `http://localhost:5173/reset-password?token=${token}`;
      const text = `Hello,\n\nYou requested to reset your password. Please click the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.`;

      await sendEmail(email, subject, text);
    }
    channel.ack(msg!);
  });

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const payload = JSON.parse(msg.content.toString());
      const transaction = payload.data || payload;
      
      console.log('📬 Email Service: Processing for transaction:', transaction.id || 'N/A');

      try {
        const response = await axios.get(`${IDENTITY_SERVICE_URL}/api/users/${transaction.toAccountId}`);
        const user = response.data;
        
        if (user && user.email) {
          const subject = 'Transaction Alert: Payment Received';
          const text = `Hello,\n\nYou have received a payment of ${transaction.amount} from account ${transaction.fromAccountId}.\n\nTransaction ID: ${transaction.id}\nDate: ${new Date().toLocaleString()}\n\nThank you for choosing Zenith Banking.`;
          
          await sendEmail(user.email, subject, text);
          console.log('✅ Email Service: Notification successful for:', user.email);
        }
      } catch (err) {
        console.error('❌ Email Service: Failed to process notification:', (err as Error).message);
      }

      channel.ack(msg);
    }
  });

  const PORT = process.env.PORT || 3008; // New port for email service
  app.listen(PORT, () => {
    console.log(`Email Service listening on port ${PORT}`);
  });
}

start().catch(console.error);
