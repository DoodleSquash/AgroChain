const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const batches = await prisma.batch.findMany();
  for (const b of batches) {
    let category = 'Vegetables';
    if (b.crop.toLowerCase().includes('wheat') || b.crop.toLowerCase().includes('rice') || b.crop.toLowerCase().includes('grain')) category = 'Grains';
    if (b.crop.toLowerCase().includes('mango') || b.crop.toLowerCase().includes('fruit') || b.crop.toLowerCase().includes('berry')) category = 'Fruits';
    if (b.crop.toLowerCase().includes('milk') || b.crop.toLowerCase().includes('dairy')) category = 'Dairy';
    if (b.crop.toLowerCase().includes('tulsi') || b.crop.toLowerCase().includes('herb')) category = 'Herbs';

    let location = b.location || '';
    if (location.toLowerCase().includes('mumbai')) location = 'Mumbai, Maharashtra';
    if (location.toLowerCase().includes('punjab')) location = 'Amritsar, Punjab';

    await prisma.batch.update({
      where: { id: b.id },
      data: { category, location }
    });
  }
  console.log('Migration complete');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
