import { Module } from '@nestjs/common';
import { TemporalPaymentAdapter } from './temporal-payment.adapter';
import { TemporalClientService } from './temporal-client.service';

@Module({
  providers: [TemporalClientService, TemporalPaymentAdapter, { provide: 'TemporalPaymentPort', useClass: TemporalPaymentAdapter }],
  exports: ['TemporalPaymentPort', TemporalClientService],
})
export class TemporalModule { }
