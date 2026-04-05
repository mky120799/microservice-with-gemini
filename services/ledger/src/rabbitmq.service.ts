import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import * as amqp from 'amqplib';
import { LedgerService } from './ledger.service';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: any;
  private readonly exchange = 'transaction-completed-exchange';
  private readonly userExchange = 'user-created';

  constructor(private moduleRef: ModuleRef) {}

  async onModuleInit() {
    const url = process.env.RABBITMQ_URL || 'amqp://localhost';
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchange, 'fanout', { durable: true });
      
      // Consume user-created events
      await this.channel.assertExchange(this.userExchange, 'fanout', { durable: true });
      const q = await this.channel.assertQueue('', { exclusive: true });
      await this.channel.bindQueue(q.queue, this.userExchange, '');
      
      this.channel.consume(q.queue, async (msg: amqp.Message | null) => {
        if (msg) {
          try {
            const data = JSON.parse(msg.content.toString());
            const payload = data.data || data; // Handle different structures
            if (payload && payload.userId) {
              console.log(`📥 Ledger: Received user-created for user ${payload.userId}`);
              const ledgerService = this.moduleRef.get(LedgerService, { strict: false });
              await ledgerService.createAccount(payload.userId);
            }
          } catch (e) {
            console.error('Error processing user-created event', e);
          }
        }
      }, { noAck: true });

      console.log('✅ Ledger: Connected to RabbitMQ and listening for events');
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
