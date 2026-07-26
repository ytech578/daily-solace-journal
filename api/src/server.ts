import { app } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

async function main() {
  // Verify DB connection before accepting traffic
  await prisma.$connect();
  console.log('✓ Database connected');

  const server = app.listen(env.PORT, () => {
    console.log(`✓ API running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      console.log('✓ Database disconnected. Bye!');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
