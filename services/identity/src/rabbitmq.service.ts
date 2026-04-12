import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export class RabbitMQService {
  private static channel: amqp.Channel;

  static async init(retries = 5) {
    if (this.channel) return;
    while (retries > 0) {
      try {
        const connection = await amqp.connect(RABBITMQ_URL);
        this.channel = await connection.createChannel();
        console.log('✅ Identity Service: RabbitMQ Connected');
        return;
      } catch (err) {
        retries--;
        console.error(`❌ Identity Service: RabbitMQ Connection Failed (${retries} retries left)`);
        if (retries === 0) throw err;
        await new Promise(res => setTimeout(res, 5000));
      }
    }
  }

  static async publish(exchange: string, data: any) {
    if (!this.channel) await this.init();
    
    await this.channel.assertExchange(exchange, 'fanout', { durable: true });
    this.channel.publish(exchange, '', Buffer.from(JSON.stringify({
      data,
      timestamp: new Date()
    })));
  }
}
