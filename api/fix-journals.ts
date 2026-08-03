import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.journal.updateMany({
    data: { isActive: true, isIndexed: true },
  });
  console.log(`Updated ${result.count} journals → isActive=true, isIndexed=true`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
