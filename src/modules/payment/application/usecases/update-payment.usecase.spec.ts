import { UpdatePaymentUseCase } from './update-payment.usecase';
import { PaymentRepository, PaymentFilters } from '../../domain/payment.repository';
import { Payment } from '../../domain/payment';

class InMemoryRepo implements PaymentRepository {
    items: Payment[] = [];
    async create(p: Payment) { this.items.push(p); }
    async update(p: Payment) {
        this.items = this.items.map(x => x.id === p.id ? p : x);
    }
    async findById(id: string) { return this.items.find(x => x.id === id) ?? null; }
    async findByExternalReference(ref: string) { return this.items.find(x => x.externalReference === ref) ?? null; }
    async list(f: PaymentFilters) { return this.items; }
}

describe('UpdatePaymentUseCase', () => {
    it('Should update payment status and description', async () => {
        const repo = new InMemoryRepo();
        const payment = new Payment('1', 'cpf', 'desc', 10, 'PIX', 'PENDING');
        repo.items.push(payment);

        const uc = new UpdatePaymentUseCase(repo);
        await uc.execute({ id: '1', status: 'PAID', description: 'updated desc' });

        const updated = await repo.findById('1');
        expect(updated).not.toBeNull();
        expect(updated?.status).toBe('PAID');
        expect(updated?.description).toBe('updated desc');
    });

    it('Should throw error when payment not found', async () => {
        const repo = new InMemoryRepo(); // empty
        const uc = new UpdatePaymentUseCase(repo);

        await expect(uc.execute({ id: '999', status: 'PAID' }))
            .rejects.toThrow('PAYMENT_NOT_FOUND');
    });
});
