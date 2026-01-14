import axios from 'axios';
import { randomUUID } from 'crypto';
import { createConnection } from '../../temporal/db';
import { PaymentOrmEntity } from '../../modules/payment/infra/typeorm/payment.orm-entity';

export async function createPendingPayment(input: {
  cpf: string;
  description: string;
  amount: number;
  externalReference: string;
}): Promise<string> {
  const conn = await createConnection();
  const repo = conn.getRepository(PaymentOrmEntity);

  const paymentId = randomUUID();
  const entity = repo.create({
    id: paymentId,
    cpf: input.cpf,
    description: input.description,
    amount: input.amount.toFixed(2) ? input.amount.toFixed(2) : '0.00',
    paymentMethod: 'CREDIT_CARD',
    status: 'PENDING',
    externalReference: input.externalReference,
  });

  await repo.insert(entity);
  return paymentId;
}

export async function createMercadoPagoPreference(input: {
  paymentId: string;
  cpf: string;
  description: string;
  amount: number;
  externalReference: string;
}): Promise<{ preferenceId: string; initPoint?: string }> {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error('MP_ACCESS_TOKEN not configured');

  // Documentação oficial:
  // https://www.mercadopago.com.br/developers/en/docs/checkout-pro/introduction
  // https://www.mercadopago.com.br/developers/en/reference/preferences/_checkout_preferences/post

  const baseUrl = 'https://api.mercadopago.com';
  const notificationUrl = `${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/api/mercadopago/webhook`;

  const payload = {
    items: [
      {
        title: input.description,
        quantity: 1,
        unit_price: Number(input.amount),
      },
    ],
    external_reference: input.externalReference,
    notification_url: notificationUrl,
    metadata: {
      payment_id: input.paymentId,
      cpf: input.cpf,
    },
  };

  const res = await axios.post(`${baseUrl}/checkout/preferences`, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(process.env.MP_INTEGRATOR_ID ? { 'x-integrator-id': process.env.MP_INTEGRATOR_ID } : {}),
    },
  });

  const preferenceId = res.data.id as string;
  const initPoint = res.data.init_point as string | undefined;

  // persiste preferenceId no pagamento
  const conn = await createConnection();
  const repo = conn.getRepository(PaymentOrmEntity);
  await repo.update({ id: input.paymentId }, { preferenceId });

  return { preferenceId, initPoint };
}

export async function resolvePaymentStatusAndPersist(input: {
  paymentId: string;
  externalReference: string;
  notification: { topic?: string; id?: string };
}): Promise<void> {
  // Para o teste, fazemos uma resolução simplificada:
  // - se houver `notification.id`, tenta consultar MP (quando topic/id estiverem disponíveis)
  // - caso contrário, mantém PENDING (você pode evoluir para polling)
  const accessToken = process.env.MP_ACCESS_TOKEN;
  const conn = await createConnection();
  const repo = conn.getRepository(PaymentOrmEntity);

  let finalStatus: 'PAID' | 'FAIL' | 'PENDING' = 'PENDING';

  if (accessToken && input.notification?.id) {
    try {
      const baseUrl = 'https://api.mercadopago.com';
      const paymentId = input.notification.id;
      const res = await axios.get(`${baseUrl}/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // MP status mapping (simplificado)
      const mpStatus = String(res.data.status || '').toLowerCase();
      if (mpStatus === 'approved') finalStatus = 'PAID';
      else if (mpStatus === 'rejected' || mpStatus === 'cancelled') finalStatus = 'FAIL';
      else finalStatus = 'PENDING';
    } catch (e) {
      // em caso de falha no polling, marca FAIL (para não ficar infinito no teste)
      finalStatus = 'FAIL';
    }
  }

  await repo.update({ id: input.paymentId }, { status: finalStatus });
}
