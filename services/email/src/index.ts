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
        // Notify Receiver (toAccountId)
        const toResponse = await axios.get(`${IDENTITY_SERVICE_URL}/api/users/${transaction.toAccountId}`);
        const toUser = toResponse.data;
        
        if (toUser && toUser.email) {
          const subject = transaction.type === 'CREDIT' ? 'Top Up Successful' : 'Transaction Alert: Payment Received';
          const text = transaction.type === 'CREDIT' 
            ? `Hello,\n\nYour account has been successfully topped up with $${transaction.amount}.\n\nTransaction ID: ${transaction.id}\nDate: ${new Date().toLocaleString()}\n\nThank you for choosing Zenith Banking.`
            : `Hello,\n\nYou have received a payment of $${transaction.amount} from User #${transaction.fromAccountId}.\n\nTransaction ID: ${transaction.id}\nDate: ${new Date().toLocaleString()}\n\nThank you for choosing Zenith Banking.`;
          
          await sendEmail(toUser.email, subject, text);
          console.log('✅ Email Service: Receiver notification successful for:', toUser.email);
        }

        // Notify Sender (fromAccountId) if it's a transfer
        if (transaction.fromAccountId && transaction.fromAccountId > 0) {
          try {
            const fromResponse = await axios.get(`${IDENTITY_SERVICE_URL}/api/users/${transaction.fromAccountId}`);
            const fromUser = fromResponse.data;

            if (fromUser && fromUser.email) {
               const subject = 'Transfer Successful';
               const text = `Hello,\n\nYou have successfully sent $${transaction.amount} to User #${transaction.toAccountId}.\n\nTransaction ID: ${transaction.id}\nDate: ${new Date().toLocaleString()}\n\nThank you for choosing Zenith Banking.`;
               
               await sendEmail(fromUser.email, subject, text);
               console.log('✅ Email Service: Sender notification successful for:', fromUser.email);
            }
          } catch (senderErr) {
            console.error('❌ Email Service: Failed to fetch sender for notification');
          }
        }

      } catch (err) {
        console.error('❌ Email Service: Failed to process notification:', (err as Error).message);
      }

      channel.ack(msg);
    }
  });

  // Ticketing Service Consumer
  const ticketingExchange = 'ticketing-exchange';
  const ticketingQueue = 'email.ticketing';
  await channel.assertExchange(ticketingExchange, 'fanout', { durable: true });
  await channel.assertQueue(ticketingQueue, { durable: true });
  await channel.bindQueue(ticketingQueue, ticketingExchange, '');

  console.log('🚀 Email Service: Waiting for ticketing messages in %s bound to %s', ticketingQueue, ticketingExchange);

  channel.consume(ticketingQueue, async (msg) => {
    if (msg !== null) {
      const payload = JSON.parse(msg.content.toString());
      const { pattern, data } = payload;
      console.log(`📬 Email Service: Processing ticketing event ${pattern}`);

      try {
        const response = await axios.get(`${IDENTITY_SERVICE_URL}/api/users/${data.userId}`);
        const user = response.data;

        if (user && user.email) {
          let subject = '';
          let text = '';

          if (pattern === 'ticket-created') {
            subject = `New Ticket Created: #${data.title}`;
            text = `Hello,\n\nYour support ticket has been created successfully.\n\nTicket ID: ${data.id}\nTitle: ${data.title}\nPriority: ${data.priority}\nStatus: ${data.status}\n\nWe will get back to you soon.`;
          } else if (pattern === 'ticket-status-updated') {
            subject = `Ticket Update: #${data.title}`;
            text = `Hello,\n\nYour ticket status has been updated.\n\nTicket ID: ${data.id}\nTitle: ${data.title}\nNew Status: ${data.status}\n\nThank you for your patience.`;
          }

          if (subject && text) {
            await sendEmail(user.email, subject, text);
            console.log('✅ Email Service: Ticketing notification sent to:', user.email);
          }
        }
      } catch (err) {
        console.error('❌ Email Service: Failed to process ticketing email:', (err as Error).message);
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
