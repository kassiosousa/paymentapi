import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database.module';
import { PaymentModule } from './payment/payment.module';
import { MercadoPagoModule } from './mercadopago/mercadopago.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    PaymentModule,
    MercadoPagoModule,
  ],
})
export class AppModule {}
