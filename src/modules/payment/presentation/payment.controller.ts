import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentService } from '../services/payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Post()
  async create(@Body() dto: CreatePaymentDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentDto) {
    await this.service.update({ id, ...dto });
    return { ok: true };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Get()
  async list(@Query('cpf') cpf?: string, @Query('paymentMethod') paymentMethod?: 'PIX' | 'CREDIT_CARD') {
    return this.service.list({ cpf, paymentMethod });
  }
}
