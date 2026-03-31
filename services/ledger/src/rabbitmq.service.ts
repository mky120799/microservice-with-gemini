import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: any;
  private readonly exchange = 'transaction-completed-exchange';

  async onModuleInit() {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost';
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchange, 'fanout', { durable: true });
      console.log('✅ Ledger: Connected to RabbitMQ and asserted fanout exchange');
    } catch (err) {
      console.error('❌ Ledger: Failed to connect to RabbitMQ', err);
    }
  }

  async publish(pattern: string, data: any) {
    if (!this.channel) {
      console.error('❌ Ledger: RabbitMQ channel not available for publishing');
      return;
    }
    const message = JSON.stringify({ pattern, data });
    this.channel.publish(this.exchange, '', Buffer.from(message));
    console.log(`📢 Ledger: Published event ${pattern} to exchange`);
  }

  async onModuleDestroy() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
    } catch (err) {
      // Ignore close errors
    }
  }
}
