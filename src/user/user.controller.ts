import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
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

  // FEEDBACK FIX: Rute untuk update profil
  @Patch('profile')
  @ApiOperation({ summary: 'Update data profil user' })
  updateProfile(@Req() req: any, @Body() data: { name?: string; email?: string }) {
    return this.userService.updateProfile(req.user.id, data);
  }
}