import { Column, Entity, PrimaryColumn, Index } from 'typeorm';

@Entity({ name: 'payments' })
export class PaymentOrmEntity {
  @PrimaryColumn('varchar', { length: 36 })
  id!: string;

  @Column('varchar', { length: 11 })
  cpf!: string;

  @Column('varchar', { length: 255 })
  description!: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount!: string;

  @Column('varchar', { length: 20 })
  paymentMethod!: 'PIX' | 'CREDIT_CARD';

  @Column('varchar', { length: 20 })
  status!: 'PENDING' | 'PAID' | 'FAIL';

  @Index()
  @Column('varchar', { length: 80, nullable: true })
  externalReference?: string | null;

  @Column('varchar', { length: 80, nullable: true })
  preferenceId?: string | null;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Column('datetime', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;
}
