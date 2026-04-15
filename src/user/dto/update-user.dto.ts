import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string; // Tanda "?" berarti opsional, boleh diisi boleh tidak
}
