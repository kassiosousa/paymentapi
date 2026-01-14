import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePaymentDto {
  @ApiPropertyOptional({ enum: ['PENDING', 'PAID', 'FAIL'] })
  @IsOptional()
  @IsEnum(['PENDING', 'PAID', 'FAIL'])
  status?: 'PENDING' | 'PAID' | 'FAIL';

  @ApiPropertyOptional({ example: 'Nova descrição' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
