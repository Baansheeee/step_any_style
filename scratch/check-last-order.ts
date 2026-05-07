
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function checkLastOrder() {
  const order = await prisma.order.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  if (!order) {
    console.log('No orders found.');
    return;
  }

  console.log('Order ID:', order.id);
  console.log('Items:', JSON.stringify(order.items, null, 2));
}

checkLastOrder()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
