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
    const input = '9d6ba22b-0216-4748-b130-1ea520a96c42';
    
    console.log(`Checking database for input: ${input}`);
    
    const byId = await prisma.job.findUnique({ where: { id: input } });
    if (byId) {
      console.log('FOUND as ID! Token is:', byId.token);
    } else {
      console.log('NOT FOUND as ID.');
    }

    const byToken = await prisma.job.findUnique({ where: { token: input } });
    if (byToken) {
      console.log('FOUND as TOKEN!');
    } else {
      console.log('NOT FOUND as TOKEN.');
    }

    const all = await prisma.job.findMany();
    console.log('Recent Jobs in DB:');
    all.slice(-5).forEach(j => {
      console.log(`- ID: ${j.id}, Token: ${j.token}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch(console.error);
