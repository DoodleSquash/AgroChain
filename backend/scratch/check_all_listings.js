const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'itzmesahir134@gmail.com' },
    include: {
      batches: {
        orderBy: { created_at: 'desc' },
        include: { images: true }
      }
    }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  console.log('Listings count:', user.batches.length);
  user.batches.forEach((b, i) => {
    console.log(`Listing ${i+1}:`, b.crop, b.status, b.quantity, b.created_at);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
