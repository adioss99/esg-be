import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding users...');

  const hashed = await bcrypt.hash('asdfasdf', 10);
  const seed = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@mail.com' },
      update: {},
      create: {
        name: 'admin',
        email: 'admin@mail.com',
        password: hashed,
        role: 'ADMIN',
      },
    }),
    prisma.user.upsert({
      where: { email: 'qc1@mail.com' },
      update: {},
      create: {
        name: 'qc10',
        email: 'qc1@mail.com',
        password: hashed,
        role: 'QC',
      },
    }),
    prisma.user.upsert({
      where: { email: 'operator10@mail.com' },
      update: {},
      create: {
        name: 'operator10',
        email: 'operator10@mail.com',
        password: hashed,
        role: 'OPERATOR',
      },
    }),
  ]);

  console.log('✅ Seeder finished:', seed);
}
main()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Seeder failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
