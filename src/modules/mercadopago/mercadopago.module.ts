import { Module } from '@nestjs/common';
import { MercadoPagoWebhookController } from './presentation/mercadopago-webhook.controller';
import { PaymentTypeOrmRepository } from '../payment/infra/typeorm/payment.typeorm-repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentOrmEntity } from '../payment/infra/typeorm/payment.orm-entity';
import { TemporalModule } from '../temporal/temporal.module';
import { MercadoPagoService } from './mercado-pago.service';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentOrmEntity]), TemporalModule],
  controllers: [MercadoPagoWebhookController],
  providers: [PaymentTypeOrmRepository, MercadoPagoService],
})
export class MercadoPagoModule { }
