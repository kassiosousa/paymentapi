import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentOrmEntity } from './infra/typeorm/payment.orm-entity';
import { PaymentTypeOrmRepository } from './infra/typeorm/payment.typeorm-repository';
import { PaymentController } from './presentation/payment.controller';
import { PaymentService } from './services/payment.service';
import { TemporalModule } from '../temporal/temporal.module';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentOrmEntity]), TemporalModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    { provide: 'PaymentRepository', useClass: PaymentTypeOrmRepository },
    PaymentTypeOrmRepository,
    {
      provide: PaymentService,
      useFactory: (repo: PaymentTypeOrmRepository, temporal: any) => new PaymentService(repo, temporal),
      inject: [PaymentTypeOrmRepository, 'TemporalPaymentPort'],
    },
  ],
  exports: [],
})
export class PaymentModule {}
