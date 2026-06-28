const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

async function test() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const email = 'test_user_' + Date.now() + '@agrochain.com';
    const name = 'Test Farmer';
    const phone = '1234567890';
    const password = 'testpassword';

    console.log('Testing user registration in database...');
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role: 'FARMER',
        is_verified: false,
        password: hashPassword(password)
      }
    });

    console.log('User created successfully:', user.id);

    const otp = '123456';
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { otp_code: otp, otp_expiry: expiry }
    });

    console.log('User updated with OTP successfully:', updated.id);

  } catch (err) {
    console.error('Error during database operation:', err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

test();
