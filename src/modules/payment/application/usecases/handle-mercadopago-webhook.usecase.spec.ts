import { HandleMercadoPagoWebhookUseCase } from './handle-mercadopago-webhook.usecase';
import { PaymentRepository, PaymentFilters } from '../../domain/payment.repository';
import { Payment } from '../../domain/payment';

class InMemoryRepo implements PaymentRepository {
    items: Payment[] = [];
    async create(p: Payment) { this.items.push(p); }
    async update(p: Payment) { this.items = this.items.map(x => x.id === p.id ? p : x); }
    async findById(id: string) { return this.items.find(x => x.id === id) ?? null; }
    async findByExternalReference(ref: string) { return this.items.find(x => x.externalReference === ref) ?? null; }
    async list(f: PaymentFilters) { return this.items; }
}

describe('HandleMercadoPagoWebhookUseCase', () => {
    it('Should return paymentId when found by externalReference', async () => {
        const repo = new InMemoryRepo();
        // Payment created with external reference same as ID usually, but lets be explicit
        const payment = new Payment('p1', 'cpf', 'desc', 10, 'CREDIT_CARD', 'PENDING');
        payment.externalReference = 'ext-123';
        repo.items.push(payment);

        const uc = new HandleMercadoPagoWebhookUseCase(repo);
        const result = await uc.execute({ externalReference: 'ext-123' });

        expect(result).not.toBeNull();
        expect(result?.paymentId).toBe('p1');
    });

    it('Should return null when not found', async () => {
        const repo = new InMemoryRepo();
        const uc = new HandleMercadoPagoWebhookUseCase(repo);
        const result = await uc.execute({ externalReference: 'missing' });

        expect(result).toBeNull();
    });
});
