import { GetPaymentUseCase } from './get-payment.usecase';
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

describe('GetPaymentUseCase', () => {
    it('Should return payment if found', async () => {
        const repo = new InMemoryRepo();
        const payment = new Payment('123', 'cpf', 'desc', 10, 'PIX', 'PENDING');
        repo.items.push(payment);

        const uc = new GetPaymentUseCase(repo);
        const result = await uc.execute('123');

        expect(result).toBeDefined();
        expect(result.id).toBe('123');
    });

    it('Should throw error if not found', async () => {
        const repo = new InMemoryRepo();
        const uc = new GetPaymentUseCase(repo);

        await expect(uc.execute('999')).rejects.toThrow('PAYMENT_NOT_FOUND');
    });
});
