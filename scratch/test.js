const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const x = await prisma.marketingSettings.findUnique({ where: { id: 'marketing_settings' } });
    console.log("Success:", x);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
