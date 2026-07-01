const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const x = await prisma.marketingSettings.create({ data: { id: 'marketing_settings' } });
    console.log("Create Success:", x);
  } catch (e) {
    console.error("Create Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
