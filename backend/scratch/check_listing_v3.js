const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { contains: 'itzmesahir134' } },
    include: {
      batches: {
        orderBy: { created_at: 'desc' },
        include: { images: true }
      }
    }
  });

  if (users.length === 0) {
    console.log('User not found even with contains');
    return;
  }

  const user = users[0];
  console.log('User ID:', user.id);
  console.log('Email:', user.email);
  if (user.batches.length === 0) {
    console.log('No listings found.');
  } else {
    console.log('Newest Listing:', JSON.stringify(user.batches[0], null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
