export type PaymentMethod = 'PIX' | 'CREDIT_CARD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAIL';

export class Payment {
  constructor(
    public readonly id: string,
    public cpf: string,
    public description: string,
    public amount: number,
    public paymentMethod: PaymentMethod,
    public status: PaymentStatus,
    public externalReference?: string,
    public preferenceId?: string,
  ) { }

  markPaid() {
    this.status = 'PAID';
  }

  markFail() {
    this.status = 'FAIL';
  }

  markPending() {
    this.status = 'PENDING';
  }
}
