import { randomUUID } from 'crypto';
import { Payment } from '../../domain/payment';
import { PaymentRepository } from '../../domain/payment.repository';
import { CreatePaymentCommand } from '../dto/create-payment.command';
import { TemporalPaymentPort } from '../ports/temporal.port';
import { Inject } from '@nestjs/common';

export class CreatePaymentUseCase {
  constructor(
    private readonly repo: PaymentRepository,

    @Inject('TemporalPaymentPort')
    private readonly temporal: TemporalPaymentPort,
  ) { }

  async execute(cmd: CreatePaymentCommand): Promise<{ id: string; status: string; initPoint?: string }> {
    if (cmd.paymentMethod === 'PIX') {
      const payment = new Payment(randomUUID(), cmd.cpf, cmd.description, cmd.amount, 'PIX', 'PENDING');
      await this.repo.create(payment);
      return { id: payment.id, status: payment.status };
    }

    const payment = new Payment(randomUUID(), cmd.cpf, cmd.description, cmd.amount, 'CREDIT_CARD', 'PENDING');
    await this.repo.create(payment);

    await this.temporal.startCreditCardWorkflow({
      paymentId: payment.id,
      externalReference: payment.id,
      cpf: payment.cpf,
      description: payment.description,
      amount: payment.amount,
    });

    return {
      id: payment.id,
      status: payment.status,
    };


  }
}
