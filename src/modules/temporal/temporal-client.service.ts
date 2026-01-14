import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Client, Connection, WorkflowClient, WorkflowHandle } from '@temporalio/client';

@Injectable()
export class TemporalClientService implements OnModuleInit, OnModuleDestroy {
  private connection!: Connection;
  private client!: Client;

  // Centralize: API e Worker precisam concordar com o mesmo nome.
  public readonly taskQueue = process.env.TEMPORAL_TASK_QUEUE ?? 'payment-task-queue';

  async onModuleInit() {
    // Em docker-compose normalmente é "temporal:7233".
    // Se você rodar fora do docker, pode setar TEMPORAL_ADDRESS=localhost:7233
    const address = process.env.TEMPORAL_ADDRESS ?? 'temporal:7233';
    const namespace = process.env.TEMPORAL_NAMESPACE ?? 'default';

    this.connection = await Connection.connect({ address });
    this.client = new Client({ connection: this.connection, namespace });
  }

  async onModuleDestroy() {
    await this.connection?.close();
  }

  /**
   * WorkflowId determinístico evita workflows duplicados quando o request de cartão
   * é reenviado (timeout do client, retry, etc).
   */
  workflowIdForPaymentId(paymentId: string) {
    return `payment-cc-${paymentId}`;
  }

  /**
   * Mantém compatibilidade com seu webhook: externalReference == paymentId (recomendado).
   */
  workflowIdForExternalReference(externalReference: string) {
    return this.workflowIdForPaymentId(externalReference);
  }

  /**
   * Exponha o WorkflowClient para adapters.
   */
  get workflow(): WorkflowClient {
    return this.client.workflow;
  }

  async signalPaymentResult(workflowId: string, payload: any) {
    const handle: WorkflowHandle<any> = this.client.workflow.getHandle(workflowId);
    await handle.signal('paymentResult', payload);
  }
}
