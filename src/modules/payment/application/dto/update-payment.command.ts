import { PaymentStatus } from '../../domain/payment';

export type UpdatePaymentCommand = {
  id: string;
  status?: PaymentStatus;
  description?: string;
};
