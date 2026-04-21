import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger'; // <-- Tambah ApiBody
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountService } from './account.service';

@ApiTags('Account')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @ApiOperation({ summary: 'Membuat rekening baru' })
  createAccount(@Req() req: any) {
    return this.accountService.createAccount(req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Melihat semua rekening milik user' })
  getAccounts(@Req() req: any) {
    return this.accountService.getAccounts(req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data rekening (Label/Active status)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        label: { type: 'string', example: 'Tabungan Skripsi UI' },
      },
    },
  })
  updateAccount(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: { label?: string },
  ) {
    return this.accountService.updateAccount(req.user.id, id, data);
  }
}
