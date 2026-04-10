import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function resetPassword() {
  const email = 'farmer@gmail.com'; // Change this if needed
  const newPassword = 'Password123';  // Change this to your desired password

  const hash = crypto.createHash('sha256').update(newPassword).digest('hex');

  const user = await prisma.user.update({
    where: { email },
    data: { password: hash },
  });

  console.log(`✅ Password reset for ${user.email} (${user.role})`);
  await prisma.$disconnect();
}

resetPassword().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
