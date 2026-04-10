const { PrismaClient } = require('./node_modules/@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();
const email = 'farmer@gmail.com';
const newPassword = 'Password123';

const hash = crypto.createHash('sha256').update(newPassword).digest('hex');

prisma.user.update({ where: { email }, data: { password: hash } })
  .then(u => { console.log('Password reset for:', u.email); return prisma.$disconnect(); })
  .catch(e => { console.error(e); return prisma.$disconnect(); });
