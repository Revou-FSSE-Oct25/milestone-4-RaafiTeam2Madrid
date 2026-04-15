import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // --- FITUR REGISTER ---
  async register(dto: RegisterDto) {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      return { message: 'Registrasi berhasil', data: user };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Email sudah terdaftar');
      }
      throw new InternalServerErrorException('Terjadi kesalahan pada server');
    }
  }

  // --- FITUR LOGIN ---
  async login(dto: LoginDto) {
    // 1. Cari user berdasarkan email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    // 2. Jika user tidak ada ATAU password tidak cocok (menggunakan bcrypt.compare)
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // 3. Jika cocok, buatkan JWT Token
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      message: 'Login berhasil',
      access_token: token,
    };
  }
}