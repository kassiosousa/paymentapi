import { Body, Controller, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaymentTypeOrmRepository } from '../../payment/infra/typeorm/payment.typeorm-repository';
import { TemporalClientService } from '../../temporal/temporal-client.service';

@ApiTags('mercadopago')
@Controller('mercadopago')
export class MercadoPagoWebhookController {
  constructor(
    private readonly repo: PaymentTypeOrmRepository,
    private readonly temporal: TemporalClientService,
  ) { }

  @Post('webhook')
  async webhook(
    @Query('topic') topic?: string,
    @Query('id') id?: string,
    @Body() body?: any,
  ) {
    const externalReference: string | undefined =
      body?.external_reference || body?.data?.external_reference || body?.externalReference;

    if (!externalReference) {
      return { ok: true, ignored: true, reason: 'missing external_reference' };
    }

    const payment = await this.repo.findByExternalReference(externalReference);
    if (!payment) return { ok: true, ignored: true, reason: 'payment not found' };

    const workflowId = this.temporal.workflowIdForExternalReference(externalReference);

    await this.temporal.signalPaymentResult(
      workflowId,
      {
        status: body?.status,
        externalReference,
      }
    );

    return { ok: true };
  }
}
