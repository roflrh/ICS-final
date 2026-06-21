import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let db: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  db = new PrismaClient({ adapter, log: ['error'] });
} else {
  // 개발 모드에서는 핫 리로딩으로 인한 커넥션 누수를 방지하기 위해 global에 인스턴스 보관
  if (!globalForPrisma.prisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({
      adapter,
      log: ['query', 'error', 'warn'],
    });
  }
  db = globalForPrisma.prisma;
}

export { db };
