import { PaymentRepository } from '../../domain/payment.repository';
import { Payment } from '../../domain/payment';

export class GetPaymentUseCase {
  constructor(private readonly repo: PaymentRepository) {}

  async execute(id: string): Promise<Payment> {
    const payment = await this.repo.findById(id);
    if (!payment) throw new Error('PAYMENT_NOT_FOUND');
    return payment;
  }
}
