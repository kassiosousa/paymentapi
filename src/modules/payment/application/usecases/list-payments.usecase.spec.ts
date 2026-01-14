import { ListPaymentsUseCase } from './list-payments.usecase';
import { PaymentRepository, PaymentFilters } from '../../domain/payment.repository';
import { Payment } from '../../domain/payment';

class InMemoryRepo implements PaymentRepository {
    items: Payment[] = [];
    async create(p: Payment) { this.items.push(p); }
    async update(p: Payment) { this.items = this.items.map(x => x.id === p.id ? p : x); }
    async findById(id: string) { return this.items.find(x => x.id === id) ?? null; }
    async findByExternalReference(ref: string) { return this.items.find(x => x.externalReference === ref) ?? null; }
    async list(filters: PaymentFilters) {
        return this.items.filter(item => {
            if (filters.cpf && item.cpf !== filters.cpf) return false;
            if (filters.status && item.status !== filters.status) return false;
            return true;
        });
    }
}

describe('ListPaymentsUseCase', () => {
    it('Should list payments with filters', async () => {
        const repo = new InMemoryRepo();
        repo.items.push(new Payment('1', '111', 'd1', 10, 'PIX', 'PENDING'));
        repo.items.push(new Payment('2', '111', 'd2', 20, 'PIX', 'PAID'));
        repo.items.push(new Payment('3', '222', 'd3', 30, 'PIX', 'PENDING'));

        const uc = new ListPaymentsUseCase(repo);

        // Filter by CPF
        const result1 = await uc.execute({ cpf: '111' });
        expect(result1).toHaveLength(2);

        // Filter by Status
        const result2 = await uc.execute({ status: 'PENDING' });
        expect(result2).toHaveLength(2); // 1 and 3

        // Filter by both
        const result3 = await uc.execute({ cpf: '111', status: 'PAID' });
        expect(result3).toHaveLength(1);
        expect(result3[0].id).toBe('2');
    });
});
