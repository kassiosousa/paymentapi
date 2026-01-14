import { CreditCardStartResult } from './temporal.types';

export interface TemporalPaymentPort {
  startCreditCardWorkflow(input: {
    paymentId: string;
    externalReference: string;
    cpf: string;
    description: string;
    amount: number;
  }): Promise<CreditCardStartResult>;
}

