import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    // 1. Amankan dari kemungkinan 'null'
    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // 2. Teknik Destructuring: Pisahkan password, masukkan sisanya ke variabel 'userWithoutPassword'
    const { password, ...userWithoutPassword } = user;
    
    return userWithoutPassword;
  }

  // --- FITUR UPDATE PROFIL ---
  async updateProfile(userId: number, dto: UpdateUserDto) {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name,
      },
    });

    // Gunakan teknik yang sama di sini
    const { password, ...userWithoutPassword } = updatedUser;

    return {
      message: 'Profil berhasil diperbarui',
      data: userWithoutPassword,
    };
  }
}