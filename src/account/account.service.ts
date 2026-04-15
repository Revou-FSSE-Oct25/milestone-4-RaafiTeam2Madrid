import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountService {
  constructor(private prisma: PrismaService) {}

  async createAccount(userId: number) {
    try {
      const accountNumber = Math.floor(
        Math.random() * 9000000000 + 1000000000,
      ).toString();

      const account = await this.prisma.account.create({
        data: {
          accountNumber,
          userId,
          balance: 0.0,
        },
      });

      return {
        message: 'Rekening berhasil dibuat',
        data: account,
      };
    } catch (error) {
      throw new InternalServerErrorException('Gagal membuat rekening');
    }
  }

  async getMyAccounts(userId: number) {
    return this.prisma.account.findMany({
      where: { userId },
    });
  }

  // --- FITUR DELETE (TUTUP REKENING) ---
  async deleteAccount(userId: number, accountNumber: string) {
    // 1. Cari rekeningnya
    const account = await this.prisma.account.findUnique({
      where: { accountNumber },
    });

    // 2. Validasi keamanan
    if (!account) {
      throw new NotFoundException('Rekening tidak ditemukan');
    }
    if (account.userId !== userId) {
      throw new UnauthorizedException(
        'Anda tidak berhak menghapus rekening ini',
      );
    }

    // 3. Syarat bank: Saldo harus 0!
    if (Number(account.balance) > 0) {
      throw new BadRequestException(
        'Kosongkan saldo Anda terlebih dahulu sebelum menutup rekening',
      );
    }

    try {
      // 4. Hapus rekening
      await this.prisma.$transaction(async (prisma) => {
        await prisma.transaction.deleteMany({
          where: {
            OR: [
              { sourceAccountId: account.id },
              { destinationAccountId: account.id },
            ],
          },
        });

        await prisma.account.delete({
          where: { id: account.id },
        });
      });

      return {
        message: `Rekening ${accountNumber} berhasil ditutup dan dihapus`,
      };
    } catch (error) {
      throw new InternalServerErrorException('Gagal menghapus rekening');
    }
  }
}
