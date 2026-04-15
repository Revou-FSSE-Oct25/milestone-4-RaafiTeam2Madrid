import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DepositWithdrawDto, TransferDto } from './dto/transaction.dto';

@Controller('transaction')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('deposit')
  deposit(@Req() req, @Body() dto: DepositWithdrawDto) {
    return this.transactionService.deposit(req.user.id, dto);
  }

  @Post('withdraw')
  withdraw(@Req() req, @Body() dto: DepositWithdrawDto) {
    return this.transactionService.withdraw(req.user.id, dto);
  }

  @Post('transfer')
  transfer(@Req() req, @Body() dto: TransferDto) {
    return this.transactionService.transfer(req.user.id, dto);
  }

  // Endpoint Baru: GET /transaction/history/:accountNumber
  @Get('history/:accountNumber')
  getHistory(@Req() req, @Param('accountNumber') accountNumber: string) {
    return this.transactionService.getHistory(req.user.id, accountNumber);
  }
}
