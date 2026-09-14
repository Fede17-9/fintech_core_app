import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';
import { createApp } from './presentation/app.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL no está configurada.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });
const app = createApp(prisma);
const port = Number(process.env.PORT ?? 3000);

const server = app.listen(port, () => {
  console.log(`API ejecutándose en http://localhost:${port}`);
});

const shutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} recibido. Cerrando la API...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.once('SIGINT', () => void shutdown('SIGINT'));
process.once('SIGTERM', () => void shutdown('SIGTERM'));
