import { CreatePaymentUseCase } from './create-payment.usecase';
import { PaymentRepository } from '../../domain/payment.repository';
import { TemporalPaymentPort } from '../ports/temporal.port';
import { Payment } from '../../domain/payment';

class InMemoryRepo implements PaymentRepository {
  items: Payment[] = [];
  async create(p: Payment) { this.items.push(p); }
  async update(p: Payment) { this.items = this.items.map(x => x.id === p.id ? p : x); }
  async findById(id: string) { return this.items.find(x => x.id === id) ?? null; }
  async findByExternalReference(externalReference: string) { return this.items.find(x => x.externalReference === externalReference) ?? null; }
  async list() { return this.items; }
}

describe('CreatePaymentUseCase', () => {
  it('Create PIX payment as PENDING', async () => {
    const repo = new InMemoryRepo();
    const temporal: TemporalPaymentPort = {
      startCreditCardWorkflow: jest.fn() as any,
    };

    const uc = new CreatePaymentUseCase(repo, temporal);
    const out = await uc.execute({ cpf: '12345678909', description: 'pix', amount: 10, paymentMethod: 'PIX' });

    expect(out.status).toBe('PENDING');
    expect(repo.items).toHaveLength(1);
    expect(repo.items[0].paymentMethod).toBe('PIX');
  });

  it('Delegates CREDIT_CARD to Temporal', async () => {
    const repo = new InMemoryRepo();
    const temporal: TemporalPaymentPort = {
      startCreditCardWorkflow: jest.fn().mockResolvedValue({
        paymentId: 'p1',
        externalReference: 'ext',
        preferenceId: 'pref',
        initPoint: 'http://pay',
      }),
    };

    const uc = new CreatePaymentUseCase(repo, temporal);
    const out = await uc.execute({ cpf: '12345678909', description: 'cc', amount: 10, paymentMethod: 'CREDIT_CARD' });

    expect(out.status).toBe('PENDING');
    expect(out.id).toBeDefined();
    expect(temporal.startCreditCardWorkflow).toHaveBeenCalledWith(expect.objectContaining({
      cpf: '12345678909',
      description: 'cc',
      amount: 10,
      paymentId: out.id
    }));
  });
});
