import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LedgerService } from './ledger.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository, DataSource } from 'typeorm';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const accountRepository = dataSource.getRepository(Account);

  const users = [
    { userId: 1, balance: 10000 }, // admin
    { userId: 2, balance: 5000 },  // user
    { userId: 3, balance: 0 },     // auditor
  ];

  for (const u of users) {
    const existing = await accountRepository.findOne({ where: { userId: u.userId } });
    if (existing) {
      console.log(`Account for user ${u.userId} already exists.`);
      continue;
    }

    const account = accountRepository.create({
      userId: u.userId,
      balance: u.balance,
    });
    await accountRepository.save(account);
    console.log(`Created account for user ${u.userId} with balance ${u.balance}`);
  }

  await app.close();
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
