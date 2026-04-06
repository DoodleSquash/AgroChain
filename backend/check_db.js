const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const allJobs = await prisma.job.findMany({
      select: { token: true, id: true }
    });
    console.log('Total jobs found:', allJobs.length);
    console.log('Tokens in DB:', JSON.stringify(allJobs.map(j => j.token), null, 2));
    
    const target = 'tok_transport_1775821275249_ocaryd3';
    const match = await prisma.job.findUnique({ where: { token: target } });
    console.log(`Searching for [${target}]:`, match ? 'FOUND' : 'NOT FOUND');
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);
