import amqp from 'amqplib';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { MongoClient } from 'mongodb';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

async function start() {
  const mongoClient = new MongoClient(MONGO_URI);
  await mongoClient.connect();
  const db = mongoClient.db('notifications');
  const collection = db.collection('history');

  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  const exchange = 'transaction-completed-exchange';
  const queue = 'notification.transaction-completed';

  await channel.assertExchange(exchange, 'fanout', { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, '');

  console.log('Waiting for messages in %s bound to %s', queue, exchange);

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const payload = JSON.parse(msg.content.toString());
      const transaction = payload.data || payload;
      console.log('🔔 Notification: Processing for transaction:', transaction.id || 'N/A');

      // Send real-time notification via Socket.io
      io.emit(`notification-${transaction.toAccountId}`, {
        message: `You received ${transaction.amount} from account ${transaction.fromAccountId}`,
        timestamp: new Date(),
      });

      // Store in MongoDB
      await collection.insertOne({
        ...transaction,
        receivedAt: new Date(),
      });

      channel.ack(msg);
    }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  const PORT = process.env.PORT || 3004;
  httpServer.listen(PORT, () => {
    console.log(`Notification Service listening on port ${PORT}`);
  });
}

start().catch(console.error);
