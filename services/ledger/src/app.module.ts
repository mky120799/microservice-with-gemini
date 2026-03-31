import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Account } from './entities/account.entity';
import { Transaction } from './entities/transaction.entity';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { RabbitMQService } from './rabbitmq.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: 5432,
      username: 'zenith_user',
      password: 'zenith_password',
      database: 'zenith_bank',
      entities: [Account, Transaction],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Account, Transaction]),
  ],
  controllers: [LedgerController],
  providers: [LedgerService, RabbitMQService],
})
export class AppModule {}
