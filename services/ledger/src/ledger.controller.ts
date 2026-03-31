import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { LedgerService } from './ledger.service';

@Controller('api/ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Post('transfer')
  async transfer(
    @Body('fromId') fromId: number,
    @Body('toId') toId: number,
    @Body('amount') amount: number,
  ) {
    return this.ledgerService.transfer(fromId, toId, amount);
  }

  @Post('topup')
  async topup(
    @Body('userId') userId: number,
    @Body('amount') amount: number,
    @Body('reference') reference: string,
  ) {
    return this.ledgerService.topup(userId, amount, reference);
  }

  @Get('balance/:userId')
  async getBalance(@Param('userId') userId: string) {
    return { balance: await this.ledgerService.getBalance(parseInt(userId)) };
  }

  @Get('transactions/:userId')
  async getTransactions(@Param('userId') userId: string) {
    return this.ledgerService.getTransactions(parseInt(userId));
  }
}
