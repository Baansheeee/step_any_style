
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local
dotenv.config({ path: join(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function listAll() {
  const profiles = await prisma.influencerProfile.findMany();
  console.log('Profiles:', profiles);

  const codes = await prisma.promoCode.findMany();
  console.log('Codes:', codes);
}

listAll()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
