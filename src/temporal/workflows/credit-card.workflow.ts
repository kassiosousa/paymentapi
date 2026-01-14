import { defineQuery, defineSignal, setHandler, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities/mercadopago.activities';

export type CreditCardWorkflowInput = {
  cpf: string;
  description: string;
  amount: number;
  externalReference: string;
};

export type CreditCardInitData = {
  paymentId: string;
  externalReference: string;
  preferenceId: string;
  initPoint?: string;
};

export const mercadoPagoNotification = defineSignal<[{ topic?: string; id?: string }]>('mercadoPagoNotification');
export const getInitData = defineQuery<CreditCardInitData>('getInitData');

const { createPendingPayment, createMercadoPagoPreference, resolvePaymentStatusAndPersist } =
  proxyActivities<typeof activities>({
    startToCloseTimeout: '30 seconds',
    retry: { maximumAttempts: 5 },
  });

export async function creditCardPaymentWorkflow(input: CreditCardWorkflowInput): Promise<void> {
  const paymentId = await createPendingPayment(input);

  const pref = await createMercadoPagoPreference({ ...input, paymentId });

  const initData: CreditCardInitData = {
    paymentId,
    externalReference: input.externalReference,
    preferenceId: pref.preferenceId,
    initPoint: pref.initPoint,
  };

  setHandler(getInitData, () => initData);

  let notification: { topic?: string; id?: string } | null = null;
  setHandler(mercadoPagoNotification, async (payload) => {
    notification = payload;
  });

  await (async () => {
    while (!notification) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  })();

  await resolvePaymentStatusAndPersist({
    paymentId,
    externalReference: input.externalReference,
    notification: notification!,
  });
}
