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

  async getAccounts(userId: number) {
    return this.prisma.account.findMany({
      where: { userId },
    });
  }

  async deleteAccount(userId: number, accountNumber: string) {
    const account = await this.prisma.account.findUnique({
      where: { accountNumber },
    });

    if (!account) {
      throw new NotFoundException('Rekening tidak ditemukan');
    }
    if (account.userId !== userId) {
      throw new UnauthorizedException(
        'Anda tidak berhak menghapus rekening ini',
      );
    }

    if (Number(account.balance) > 0) {
      throw new BadRequestException(
        'Kosongkan saldo Anda terlebih dahulu sebelum menutup rekening',
      );
    }

    try {
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

  async updateAccount(userId: number, accountId: number, data: any) {
    const account = await this.prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundException('Rekening tidak ditemukan');
    }

    if (account.userId !== userId) {
      throw new UnauthorizedException(
        'Anda tidak berhak mengubah data rekening ini',
      );
    }

    try {
      const updatedAccount = await this.prisma.account.update({
        where: { id: accountId },
        data: data as any,
      });

      return {
        message: 'Data rekening berhasil diperbarui',
        data: updatedAccount,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Gagal memperbarui rekening. Pastikan field yang dikirim valid dengan database.',
      );
    }
  }
}
