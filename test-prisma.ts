import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

console.log('Testing Prisma Instantiation...');

try {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/test';
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  console.log('Prisma instantiated successfully!', prisma);
} catch (e) {
  console.error('Prisma Error:', e);
}
