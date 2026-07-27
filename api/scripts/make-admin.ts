import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: npx ts-node scripts/make-admin.ts <user-email>');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' },
    });
    console.log(`Successfully promoted ${user.email} to ADMIN.`);
  } catch (err: any) {
    if (err.code === 'P2025') {
      console.error(`User with email ${email} not found.`);
    } else {
      console.error('An error occurred:', err.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
