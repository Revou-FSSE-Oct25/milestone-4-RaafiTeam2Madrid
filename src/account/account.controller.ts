import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('account')
@UseGuards(JwtAuthGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post('create')
  createAccount(@Req() req) {
    return this.accountService.createAccount(req.user.id);
  }

  @Get('my-accounts')
  getMyAccounts(@Req() req) {
    return this.accountService.getMyAccounts(req.user.id);
  }

  @Delete(':accountNumber')
  deleteAccount(@Req() req, @Param('accountNumber') accountNumber: string) {
    return this.accountService.deleteAccount(req.user.id, accountNumber);
  }
}
