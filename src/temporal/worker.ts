import 'reflect-metadata';
import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities/mercadopago.activities';

async function run() {
  const address = process.env.TEMPORAL_ADDRESS || 'temporal:7233';
  const connection = await NativeConnection.connect({ address });

  const taskQueue = process.env.TEMPORAL_TASK_QUEUE || 'payment-task-queue';

  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default',
    taskQueue,
    workflowsPath: require.resolve('./workflows/credit-card.workflow'),
    activities,
  });

  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
