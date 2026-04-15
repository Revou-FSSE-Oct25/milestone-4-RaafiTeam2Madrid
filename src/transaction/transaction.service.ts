import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepositWithdrawDto, TransferDto } from './dto/transaction.dto'; // Tambahkan TransferDto di sini

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  // --- FITUR SETOR TUNAI ---
  async deposit(userId: number, dto: DepositWithdrawDto) {
    const account = await this.prisma.account.findUnique({
      where: { accountNumber: dto.accountNumber },
    });

    if (!account) {
      throw new NotFoundException('Nomor rekening tidak ditemukan');
    }

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const updatedAccount = await prisma.account.update({
          where: { id: account.id },
          data: { balance: { increment: dto.amount } },
        });

        const transaction = await prisma.transaction.create({
          data: {
            type: 'DEPOSIT',
            amount: dto.amount,
            destinationAccountId: account.id,
          },
        });

        return { updatedAccount, transaction };
      });

      return {
        message: 'Setor tunai berhasil',
        data: {
          accountNumber: result.updatedAccount.accountNumber,
          amountDeposited: result.transaction.amount,
          newBalance: result.updatedAccount.balance,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Gagal melakukan setor tunai');
    }
  }

  // --- FITUR TARIK TUNAI ---
  async withdraw(userId: number, dto: DepositWithdrawDto) {
    const account = await this.prisma.account.findUnique({
      where: { accountNumber: dto.accountNumber },
    });

    if (!account) {
      throw new NotFoundException('Nomor rekening tidak ditemukan');
    }

    if (account.userId !== userId) {
      throw new UnauthorizedException(
        'Anda tidak berhak mengakses rekening ini',
      );
    }

    if (Number(account.balance) < dto.amount) {
      throw new BadRequestException('Saldo Anda tidak mencukupi');
    }

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const updatedAccount = await prisma.account.update({
          where: { id: account.id },
          data: { balance: { decrement: dto.amount } },
        });

        const transaction = await prisma.transaction.create({
          data: {
            type: 'WITHDRAW',
            amount: dto.amount,
            sourceAccountId: account.id,
          },
        });

        return { updatedAccount, transaction };
      });

      return {
        message: 'Tarik tunai berhasil',
        data: {
          accountNumber: result.updatedAccount.accountNumber,
          amountWithdrawn: result.transaction.amount,
          newBalance: result.updatedAccount.balance,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Gagal melakukan tarik tunai');
    }
  }

  // --- FITUR TRANSFER ---
  async transfer(userId: number, dto: TransferDto) {
    // 1. Cek rekening asal
    const sourceAccount = await this.prisma.account.findUnique({
      where: { accountNumber: dto.sourceAccountNumber },
    });

    if (!sourceAccount) {
      throw new NotFoundException('Rekening asal tidak ditemukan');
    }
    if (sourceAccount.userId !== userId) {
      throw new UnauthorizedException(
        'Anda tidak berhak mengakses rekening asal ini',
      );
    }
    if (Number(sourceAccount.balance) < dto.amount) {
      throw new BadRequestException('Saldo tidak mencukupi untuk transfer');
    }

    // 2. Cek rekening tujuan
    const destinationAccount = await this.prisma.account.findUnique({
      where: { accountNumber: dto.destinationAccountNumber },
    });

    if (!destinationAccount) {
      throw new NotFoundException('Rekening tujuan tidak ditemukan');
    }

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        // A. Kurangi saldo rekening asal
        const updatedSource = await prisma.account.update({
          where: { id: sourceAccount.id },
          data: { balance: { decrement: dto.amount } },
        });

        // B. Tambah saldo rekening tujuan
        await prisma.account.update({
          where: { id: destinationAccount.id },
          data: { balance: { increment: dto.amount } },
        });

        // C. Catat histori transfer
        const transaction = await prisma.transaction.create({
          data: {
            type: 'TRANSFER',
            amount: dto.amount,
            sourceAccountId: sourceAccount.id,
            destinationAccountId: destinationAccount.id,
          },
        });

        return { updatedSource, transaction };
      });

      return {
        message: 'Transfer berhasil',
        data: {
          sourceAccount: result.updatedSource.accountNumber,
          destinationAccount: dto.destinationAccountNumber,
          amountTransferred: result.transaction.amount,
          remainingBalance: result.updatedSource.balance,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Gagal melakukan transfer');
    }
  }
  // --- FITUR CEK HISTORI TRANSAKSI ---
  async getHistory(userId: number, accountNumber: string) {
    // 1. Cek apakah rekening ada dan milik user yang sedang login
    const account = await this.prisma.account.findUnique({
      where: { accountNumber },
    });

    if (!account) {
      throw new NotFoundException('Nomor rekening tidak ditemukan');
    }
    if (account.userId !== userId) {
      throw new UnauthorizedException(
        'Anda tidak berhak melihat histori rekening ini',
      );
    }

    // 2. Ambil semua transaksi di mana rekening ini menjadi pengirim (source) ATAU penerima (destination)
    const history = await this.prisma.transaction.findMany({
      where: {
        OR: [
          { sourceAccountId: account.id },
          { destinationAccountId: account.id },
        ],
      },
      orderBy: {
        createdAt: 'desc', // Urutkan dari yang paling baru
      },
    });

    return {
      message: 'Histori transaksi berhasil diambil',
      data: history,
    };
  }
}
