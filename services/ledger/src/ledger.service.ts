import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Account } from './entities/account.entity';
import { Transaction, TransactionType } from './entities/transaction.entity';
import { RabbitMQService } from './rabbitmq.service';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private dataSource: DataSource,
    private rabbitMQService: RabbitMQService,
  ) {}

  async createAccount(userId: number) {
    const existing = await this.accountRepository.findOne({ where: { userId } });
    if (existing) {
      console.log(`Account already exists for user ${userId}`);
      return existing;
    }
    
    const account = this.accountRepository.create({
      userId,
      balance: 0,
    });
    
    await this.accountRepository.save(account);
    console.log(`✅ Created ledger account for user ${userId}`);
    return account;
  }

  async transfer(fromId: number, toId: number, amount: number) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const fromAccount = await queryRunner.manager.findOne(Account, {
        where: { userId: fromId },
        lock: { mode: 'pessimistic_write' },
      });

      const toAccount = await queryRunner.manager.findOne(Account, {
        where: { userId: toId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromAccount || !toAccount) {
        throw new BadRequestException('Account not found');
      }

      if (fromAccount.balance < amount) {
        throw new BadRequestException('Insufficient funds');
      }

      fromAccount.balance = Number(fromAccount.balance) - amount;
      toAccount.balance = Number(toAccount.balance) + amount;

      await queryRunner.manager.save(fromAccount);
      await queryRunner.manager.save(toAccount);

      const transaction = new Transaction();
      transaction.fromAccountId = fromId;
      transaction.toAccountId = toId;
      transaction.amount = amount;
      transaction.type = TransactionType.TRANSFER;

      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      this.rabbitMQService.publish('transaction-completed', transaction);
      return transaction;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getBalance(userId: number) {
    const account = await this.accountRepository.findOne({ where: { userId } });
    if (!account) {
      throw new BadRequestException('Account not found');
    }
    return account.balance;
  }

  async topup(userId: number, amount: number, reference: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const account = await queryRunner.manager.findOne(Account, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!account) {
        throw new BadRequestException('Account not found');
      }

      account.balance = Number(account.balance) + amount;
      await queryRunner.manager.save(account);

      const transaction = new Transaction();
      transaction.fromAccountId = 0; // System/Stripe
      transaction.toAccountId = userId;
      transaction.amount = amount;
      transaction.type = TransactionType.CREDIT;
      transaction.status = 'COMPLETED';

      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();
      this.rabbitMQService.publish('transaction-completed', transaction);
      return transaction;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactions(userId: number) {
    return this.transactionRepository.find({
      where: [
        { fromAccountId: userId },
        { toAccountId: userId }
      ],
      order: { createdAt: 'DESC' },
      take: 10
    });
  }

  async getAllTransactions(userId: number) {
    return this.transactionRepository.find({
      where: [
        { fromAccountId: userId },
        { toAccountId: userId }
      ],
      order: { createdAt: 'DESC' }
    });
  }
}
