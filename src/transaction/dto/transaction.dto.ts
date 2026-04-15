import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

// Aturan untuk Setor & Tarik Tunai
export class DepositWithdrawDto {
  @IsString()
  @IsNotEmpty({ message: 'Nomor rekening tidak boleh kosong' })
  accountNumber: string;

  @IsNumber()
  @Min(10000, { message: 'Minimal transaksi adalah Rp 10.000' })
  amount: number;
}

// Aturan untuk Transfer antar Rekening
export class TransferDto {
  @IsString()
  @IsNotEmpty({ message: 'Nomor rekening asal tidak boleh kosong' })
  sourceAccountNumber: string;

  @IsString()
  @IsNotEmpty({ message: 'Nomor rekening tujuan tidak boleh kosong' })
  destinationAccountNumber: string;

  @IsNumber()
  @Min(10000, { message: 'Minimal transfer adalah Rp 10.000' })
  amount: number;
}
