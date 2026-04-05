import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export class RabbitMQService {
  private static channel: amqp.Channel;

  static async init() {
    if (this.channel) return;
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      this.channel = await connection.createChannel();
      console.log('✅ Identity Service: RabbitMQ Connected');
    } catch (err) {
      console.error('❌ Identity Service: RabbitMQ Connection Failed', err);
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
