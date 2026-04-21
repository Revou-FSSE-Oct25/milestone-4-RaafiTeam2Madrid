import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger'; // <-- Tambah ApiBody
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserService } from './user.service';

@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Mendapatkan data profil user' })
  getProfile(@Req() req: any) {
    return this.userService.getProfile(req.user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update data profil user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Aditya Raafi Yudhatama, S.Tr.Ars' },
        email: { type: 'string', example: 'raafi@bank.com' },
      },
    },
  })
  updateProfile(
    @Req() req: any,
    @Body() data: { name?: string; email?: string },
  ) {
    return this.userService.updateProfile(req.user.id, data);
  }
}
