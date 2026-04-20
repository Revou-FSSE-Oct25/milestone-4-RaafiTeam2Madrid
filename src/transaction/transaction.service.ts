import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DepositWithdrawDto, TransferDto } from './dto/transaction.dto';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  async deposit(userId: number, dto: DepositWithdrawDto) {
    const account = await this.prisma.account.findUnique({
      where: { accountNumber: dto.accountNumber },
    });

    if (!account) {
      throw new NotFoundException('Nomor rekening tidak ditemukan');
    }

    if (account.userId !== userId) {
      throw new UnauthorizedException(
        'Anda tidak berhak melakukan setor tunai ke rekening ini',
      );
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

  async transfer(userId: number, dto: TransferDto) {
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

    const destinationAccount = await this.prisma.account.findUnique({
      where: { accountNumber: dto.destinationAccountNumber },
    });

    if (!destinationAccount) {
      throw new NotFoundException('Rekening tujuan tidak ditemukan');
    }

    try {
      const result = await this.prisma.$transaction(async (prisma) => {
        const updatedSource = await prisma.account.update({
          where: { id: sourceAccount.id },
          data: { balance: { decrement: dto.amount } },
        });

        await prisma.account.update({
          where: { id: destinationAccount.id },
          data: { balance: { increment: dto.amount } },
        });

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

  async getHistory(userId: number, accountNumber: string) {
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

    const history = await this.prisma.transaction.findMany({
      where: {
        OR: [
          { sourceAccountId: account.id },
          { destinationAccountId: account.id },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      message: 'Histori transaksi berhasil diambil',
      data: history,
    };
  }

  async getTransactionById(userId: number, transactionId: number) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        sourceAccount: true,
        destinationAccount: true,
      },
    });

    if (!transaction) {
      throw new NotFoundException('Data transaksi tidak ditemukan');
    }

    const isSourceOwner = transaction.sourceAccount?.userId === userId;
    const isDestinationOwner =
      transaction.destinationAccount?.userId === userId;

    if (!isSourceOwner && !isDestinationOwner) {
      throw new UnauthorizedException(
        'Anda tidak berhak melihat detail transaksi ini',
      );
    }

    return {
      message: 'Detail transaksi berhasil diambil',
      data: transaction,
    };
  }
}
