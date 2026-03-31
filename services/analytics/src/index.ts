import express from 'express';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import amqp from 'amqplib';

const app = express();

const INFLUX_URL = process.env.INFLUX_URL || 'http://localhost:8086';
const INFLUX_TOKEN = process.env.INFLUX_TOKEN || 'zenithpassword';
const INFLUX_ORG = process.env.INFLUX_ORG || 'zenith_org';
const INFLUX_BUCKET = process.env.INFLUX_BUCKET || 'analytics';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

const influxDB = new InfluxDB({ url: INFLUX_URL, token: INFLUX_TOKEN });
const writeApi = influxDB.getWriteApi(INFLUX_ORG, INFLUX_BUCKET);
const queryApi = influxDB.getQueryApi(INFLUX_ORG);

async function start() {
  const connection = await amqp.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();
  const exchange = 'transaction-completed-exchange';
  const queue = 'analytics.transaction-completed';

  await channel.assertExchange(exchange, 'fanout', { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, '');

  console.log('Accounting for analytics on queue %s bound to %s', queue, exchange);

  channel.consume(queue, (msg) => {
    if (msg !== null) {
      const payload = JSON.parse(msg.content.toString());
      // Handle NestJS wrapped messages
      const transaction = payload.data || payload;
      
      console.log('📈 Analytics: Actioning transaction ID:', transaction.id || 'N/A');

      const point = new Point('transaction')
        .tag('fromAccountId', (transaction.fromAccountId || 0).toString())
        .tag('toAccountId', (transaction.toAccountId || 0).toString())
        .tag('type', transaction.type || 'unknown')
        .floatField('amount', parseFloat(transaction.amount || 0))
        .timestamp(new Date(transaction.createdAt || new Date()));

      writeApi.writePoint(point);
      writeApi.flush().catch(err => console.error('❌ Analytics: Flush failed:', err));

      channel.ack(msg);
      console.log('✅ Analytics: Message acknowledged');
    }
  });

  app.get('/api/analytics/transactions', async (req, res) => {
    const userId = req.query.userId as string;
    console.log('🔍 Analytics: Received request for userId:', userId);
    
    let fluxQuery = `from(bucket: "${INFLUX_BUCKET}")
      |> range(start: -30d)
      |> filter(fn: (r) => r["_measurement"] == "transaction")
      |> filter(fn: (r) => r["_field"] == "amount")`;

    if (userId) {
      fluxQuery += `\n|> filter(fn: (r) => r["fromAccountId"] == "${userId}" or r["toAccountId"] == "${userId}")`;
    }

    // console.log('🔍 Analytics: Executing Flux Query:', fluxQuery);

    try {
      const results: any[] = [];
      queryApi.queryRows(fluxQuery, {
        next(row: any, tableMeta: any) {
          const o = tableMeta.toObject(row);
          // console.log('📊 Analytics: Query Row:', JSON.stringify(o));
          results.push({
            id: o.id || Math.random().toString(36).substr(2, 9),
            type: o.type,
            from: parseInt(o.fromAccountId),
            to: parseInt(o.toAccountId),
            amount: parseFloat(o._value),
            timestamp: o._time,
            status: 'Settled'
          });
        },
        error(error: any) {
          console.error('InfluxDB Query Error:', error);
          res.status(500).send({ message: 'Error querying Analytics database' });
        },
        complete() {
          res.status(200).send(results);
        },
      });
    } catch (err) {
      console.error('Analytics query failed:', err);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  });

  const PORT = process.env.PORT || 3005;
  app.listen(PORT, () => {
    console.log(`Analytics Service listening on port ${PORT}`);
  });
}

start().catch(console.error);
