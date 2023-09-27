import { pm2Restart } from '../routes/admin/pm2';

export async function bounceQueue() {
  console.log('Bounding queue...');
  await pm2Restart('queue');
  await pm2Restart('scheduler');
}
