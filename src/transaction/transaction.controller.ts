import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionService } from './transaction.service';
import { DepositWithdrawDto, TransferDto } from './dto/transaction.dto';

@ApiTags('Transaction')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post('deposit')
  @ApiOperation({ summary: 'Setor tunai' })
  deposit(@Req() req: any, @Body() dto: DepositWithdrawDto) {
    return this.transactionService.deposit(req.user.id, dto);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Tarik tunai' })
  withdraw(@Req() req: any, @Body() dto: DepositWithdrawDto) {
    return this.transactionService.withdraw(req.user.id, dto);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transfer saldo' })
  transfer(@Req() req: any, @Body() dto: TransferDto) {
    return this.transactionService.transfer(req.user.id, dto);
  }

  @Get('history/:accountNumber')
  @ApiOperation({ summary: 'Lihat riwayat transaksi seluruhnya' })
  getHistory(@Req() req: any, @Param('accountNumber') accountNumber: string) {
    return this.transactionService.getHistory(req.user.id, accountNumber);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lihat detail satu transaksi spesifik' })
  getTransactionById(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.transactionService.getTransactionById(req.user.id, id);
  }
}
