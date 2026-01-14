import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { PaymentOrmEntity } from '../modules/payment/infra/typeorm/payment.orm-entity';

let ds: DataSource | null = null;

export async function createConnection(): Promise<DataSource> {
  if (ds && ds.isInitialized) return ds;

  ds = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'mysql',
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'paymentapi',
    entities: [PaymentOrmEntity],
    synchronize: true,
  });

  await ds.initialize();
  return ds;
}
