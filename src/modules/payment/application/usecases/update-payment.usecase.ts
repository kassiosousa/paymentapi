import { PaymentRepository } from '../../domain/payment.repository';
import { UpdatePaymentCommand } from '../dto/update-payment.command';

export class UpdatePaymentUseCase {
  constructor(private readonly repo: PaymentRepository) {}

  async execute(cmd: UpdatePaymentCommand): Promise<void> {
    const payment = await this.repo.findById(cmd.id);
    if (!payment) throw new Error('PAYMENT_NOT_FOUND');

    if (cmd.status) payment.status = cmd.status;
    if (cmd.description) payment.description = cmd.description;

    await this.repo.update(payment);
  }
}
