import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../domain/payment';
import { PaymentRepository, PaymentFilters } from '../../domain/payment.repository';
import { PaymentOrmEntity } from './payment.orm-entity';

@Injectable()
export class PaymentTypeOrmRepository implements PaymentRepository {
  constructor(@InjectRepository(PaymentOrmEntity) private readonly repo: Repository<PaymentOrmEntity>) {}

  async create(payment: Payment): Promise<void> {
    const entity = this.toOrm(payment);
    await this.repo.insert(entity);
  }

  async update(payment: Payment): Promise<void> {
    const entity = this.toOrm(payment);
    await this.repo.save(entity);
  }

  async findById(id: string): Promise<Payment | null> {
    const found = await this.repo.findOne({ where: { id } });
    return found ? this.fromOrm(found) : null;
  }

  async findByExternalReference(externalReference: string): Promise<Payment | null> {
    const found = await this.repo.findOne({ where: { externalReference } });
    return found ? this.fromOrm(found) : null;
  }

  async list(filters: PaymentFilters): Promise<Payment[]> {
    const qb = this.repo.createQueryBuilder('p');
    if (filters.cpf) qb.andWhere('p.cpf = :cpf', { cpf: filters.cpf });
    if (filters.paymentMethod) qb.andWhere('p.paymentMethod = :pm', { pm: filters.paymentMethod });
    if (filters.status) qb.andWhere('p.status = :st', { st: filters.status });
    qb.orderBy('p.createdAt', 'DESC');
    const rows = await qb.getMany();
    return rows.map((r) => this.fromOrm(r));
  }

  private toOrm(p: Payment): PaymentOrmEntity {
    const e = new PaymentOrmEntity();
    e.id = p.id;
    e.cpf = p.cpf;
    e.description = p.description;
    e.amount = p.amount.toFixed(2);
    e.paymentMethod = p.paymentMethod;
    e.status = p.status;
    e.externalReference = p.externalReference ?? null;
    e.preferenceId = p.preferenceId ?? null;
    return e;
  }

  private fromOrm(e: PaymentOrmEntity): Payment {
    return new Payment(
      e.id,
      e.cpf,
      e.description,
      Number(e.amount),
      e.paymentMethod,
      e.status,
      e.externalReference ?? undefined,
      e.preferenceId ?? undefined,
    );
  }
}
