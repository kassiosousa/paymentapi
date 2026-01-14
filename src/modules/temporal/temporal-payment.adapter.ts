import { Injectable } from '@nestjs/common';
import { WorkflowIdReusePolicy } from '@temporalio/client';
import { TemporalPaymentPort } from '../payment/application/ports/temporal.port';
import { CreditCardStartResult } from '../payment/application/ports/temporal.types';
import { TemporalClientService } from './temporal-client.service';

@Injectable()
export class TemporalPaymentAdapter implements TemporalPaymentPort {
  constructor(private readonly temporal: TemporalClientService) { }

  async startCreditCardWorkflow(input: { paymentId: string; externalReference: string; cpf: string; description: string; amount: number; }): Promise<CreditCardStartResult> {
    const workflowId = this.temporal.workflowIdForPaymentId(input.paymentId);

    await this.temporal.workflow.start('creditCardPaymentWorkflow', {
      taskQueue: this.temporal.taskQueue,
      workflowId,
      workflowIdReusePolicy: WorkflowIdReusePolicy.REJECT_DUPLICATE,
      args: [input],
    });

    return { workflowId };
  }
}
