import { PaymentRepository } from '../../domain/payment.repository';

export class HandleMercadoPagoWebhookUseCase {
  constructor(private readonly repo: PaymentRepository) { }

  async execute(input: { externalReference: string }): Promise<{ paymentId: string } | null> {
    const payment = await this.repo.findByExternalReference(input.externalReference);
    if (!payment) return null;
    return { paymentId: payment.id };
  }
}
