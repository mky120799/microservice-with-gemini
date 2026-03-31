import express, { Request, Response } from 'express';
import { json } from 'body-parser';
import Redis from 'ioredis';
import axios from 'axios';
import amqp from 'amqplib';
import { errorHandler, BadRequestError } from 'common';

const app = express();
app.use(json());

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: 6379,
});

const LEDGER_SERVICE_URL = process.env.LEDGER_SERVICE_URL || 'http://localhost:3002';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

let channel: amqp.Channel;

async function setupRabbitMQ() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    await channel.assertQueue('transaction-completed', { durable: true });
    console.log('Connected to RabbitMQ');
  } catch (err) {
    console.error('Failed to connect to RabbitMQ', err);
  }
}

setupRabbitMQ();

app.post('/api/transfer', async (req: Request, res: Response) => {
  const { fromId, toId, amount, idempotencyKey } = req.body;

  if (!idempotencyKey) {
    throw new BadRequestError('Idempotency key is required');
  }

  // Check Redis for existing transaction
  const cachedResponse = await redis.get(idempotencyKey);
  if (cachedResponse) {
    console.log('Returning cached response for idempotency key:', idempotencyKey);
    return res.status(200).send(JSON.parse(cachedResponse));
  }

  try {
    // Call Ledger Service
    const response = await axios.post(`${LEDGER_SERVICE_URL}/api/ledger/transfer`, {
      fromId,
      toId,
      amount,
    });

    const result = response.data;

    // Cache the result in Redis for 24 hours
    await redis.set(idempotencyKey, JSON.stringify(result), 'EX', 86400);

    res.status(201).send(result);
  } catch (err: any) {
    console.error('Transfer failed:', err.response?.data || err.message);
    res.status(err.response?.status || 500).send(err.response?.data || { message: 'Internal Server Error' });
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Transfer Service listening on port ${PORT}`);
});
