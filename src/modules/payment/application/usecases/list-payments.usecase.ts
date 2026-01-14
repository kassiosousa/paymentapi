import { PaymentRepository, PaymentFilters } from '../../domain/payment.repository';
import { Payment } from '../../domain/payment';

export class ListPaymentsUseCase {
  constructor(private readonly repo: PaymentRepository) {}

  async execute(filters: PaymentFilters): Promise<Payment[]> {
    return this.repo.list(filters);
  }
}
