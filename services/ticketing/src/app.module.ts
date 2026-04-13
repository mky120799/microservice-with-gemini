import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TicketingController } from './ticketing.controller';
import { TicketingService } from './ticketing.service';
import { Ticket } from './entities/ticket.entity';
import { AuditLog } from './entities/audit-log.entity';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: process.env.DB_USER || 'zenith_user',
      password: process.env.DB_PASSWORD || 'zenith_password',
      database: process.env.DB_NAME || 'zenith_bank',
      entities: [Ticket, AuditLog],
      synchronize: true, // Only for dev, auto-creates tables
    }),
    TypeOrmModule.forFeature([Ticket, AuditLog]),
  ],
  controllers: [TicketingController],
  providers: [TicketingService, RabbitMQService],
})
export class AppModule {}
