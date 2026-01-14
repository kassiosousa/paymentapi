import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength, Min, Validate } from 'class-validator';
import { IsCPF } from '../../../../common/validators/cpf.validator';
import { NoSqlInjection } from '../../../../common/validators/sql-injection.validator';

export class CreatePaymentDto {
  @ApiProperty({ example: '12345678909' })
  @IsString()
  @Validate(IsCPF)
  cpf!: string;

  @ApiProperty({ example: 'Cobrança referente ao pedido #123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Validate(NoSqlInjection)
  description!: string;

  @ApiProperty({ example: 199.9 })
  @IsNumber()
  @IsPositive()
  @Min(0.01)
  amount!: number;

  @ApiProperty({ enum: ['PIX', 'CREDIT_CARD'] })
  @IsEnum(['PIX', 'CREDIT_CARD'])
  paymentMethod!: 'PIX' | 'CREDIT_CARD';
}
