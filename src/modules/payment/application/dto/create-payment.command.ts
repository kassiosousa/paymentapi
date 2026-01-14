import { PaymentMethod } from '../../domain/payment';

export type CreatePaymentCommand = {
  cpf: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
};
