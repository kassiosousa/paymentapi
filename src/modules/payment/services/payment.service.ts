import { Injectable } from '@nestjs/common';
import { CreatePaymentUseCase } from '../application/usecases/create-payment.usecase';
import { UpdatePaymentUseCase } from '../application/usecases/update-payment.usecase';
import { GetPaymentUseCase } from '../application/usecases/get-payment.usecase';
import { ListPaymentsUseCase } from '../application/usecases/list-payments.usecase';
import { PaymentRepository } from '../domain/payment.repository';
import { TemporalPaymentPort } from '../application/ports/temporal.port';
import { PaymentFilters } from '../domain/payment.repository';
import { CreatePaymentCommand } from '../application/dto/create-payment.command';
import { UpdatePaymentCommand } from '../application/dto/update-payment.command';

@Injectable()
export class PaymentService {
  private readonly createUC: CreatePaymentUseCase;
  private readonly updateUC: UpdatePaymentUseCase;
  private readonly getUC: GetPaymentUseCase;
  private readonly listUC: ListPaymentsUseCase;

  constructor(repo: PaymentRepository, temporal: TemporalPaymentPort) {
    this.createUC = new CreatePaymentUseCase(repo, temporal);
    this.updateUC = new UpdatePaymentUseCase(repo);
    this.getUC = new GetPaymentUseCase(repo);
    this.listUC = new ListPaymentsUseCase(repo);
  }

  create(cmd: CreatePaymentCommand) {
    return this.createUC.execute(cmd);
  }

  update(cmd: UpdatePaymentCommand) {
    return this.updateUC.execute(cmd);
  }

  getById(id: string) {
    return this.getUC.execute(id);
  }

  list(filters: PaymentFilters) {
    return this.listUC.execute(filters);
  }
}
