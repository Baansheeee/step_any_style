
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local first
dotenv.config({ path: join(__dirname, '../.env.local') });

const ATLAS_URL = "mongodb+srv://ipl_store:ipl_store@cluster0.kctgfao.mongodb.net/iplstore?retryWrites=true&w=majority";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: ATLAS_URL,
    },
  },
});

async function migrateBranding() {
  console.log('Starting branding migration on Atlas...');

  // 1. Update InfluencerProfile defaultPrefix
  const profiles = await prisma.influencerProfile.findMany();
  console.log(`Found ${profiles.length} total influencer profiles.`);

  for (const profile of profiles) {
    if (profile.defaultPrefix.includes('IPL')) {
        const newPrefix = profile.defaultPrefix.replace(/IPL/gi, 'STYLE');
        await prisma.influencerProfile.update({
          where: { id: profile.id },
          data: { defaultPrefix: newPrefix }
        });
        console.log(`Updated profile ${profile.id}: ${profile.defaultPrefix} -> ${newPrefix}`);
    }
  }

  // 2. Update PromoCode codes
  const promoCodes = await prisma.promoCode.findMany();
  console.log(`Found ${promoCodes.length} total promo codes.`);

  for (const promo of promoCodes) {
    if (promo.code.includes('IPL')) {
        const newCode = promo.code.replace(/IPL/gi, 'STYLE');
        
        // Check if new code already exists
        const existing = await prisma.promoCode.findUnique({ where: { code: newCode } });
        if (existing) {
          console.log(`Skipping ${promo.code} -> ${newCode} because it already exists.`);
          continue;
        }

        await prisma.promoCode.update({
          where: { id: promo.id },
          data: { code: newCode }
        });
        console.log(`Updated promo code ${promo.id}: ${promo.code} -> ${newCode}`);
    }
  }

  console.log('Branding migration completed.');
}

migrateBranding()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
