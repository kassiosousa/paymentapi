import { Payment, PaymentMethod, PaymentStatus } from './payment';

export type PaymentFilters = {
  cpf?: string;
  paymentMethod?: PaymentMethod;
  status?: PaymentStatus;
};

export interface PaymentRepository {
  create(payment: Payment): Promise<void>;
  update(payment: Payment): Promise<void>;
  findById(id: string): Promise<Payment | null>;
  findByExternalReference(externalReference: string): Promise<Payment | null>;
  list(filters: PaymentFilters): Promise<Payment[]>;
}
